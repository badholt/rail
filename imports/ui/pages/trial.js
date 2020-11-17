import './trial.html';

import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import _ from 'underscore';
import Tone from 'tone';

import {calculateCenter} from '../../api/client.methods';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Sessions, Trials} from '../../api/collections';
import {Template} from 'meteor/templating';

export const collectClickEvent = (e) => JSON.parse(JSON.stringify(
    _.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
    (key, value) => (value instanceof Node) ? {
        classes: value.classList,
        id: value.id,
        parent: {
            classes: value.parentNode.classList,
            id: value.parentNode.id
        }
    } : (value instanceof Window) ? 'Window' : value, ' ')),
    conditionsMet = (input, variables) => _.every(input.conditions, (condition) =>
        _.every(condition.objects, (object) => {
            const o = variables[object.name](object.property);

            return _.every(condition.subjects, (subject) => {
                const s = variables[subject.name](subject.property);
                return variables[condition.comparison](o, s);
            });
        })),
    sessionTimers = (settings, template) => {
        console.log('%c Session renders:\t' + performance.now() + ' ', 'background: brown; color: white;');
        /** Sets Session-level timers: */
        if (settings) {
            console.log('%c ...running Session... \t' + performance.now() + ' ', 'background: brown; color: white;');
            /** Delays onset of first trial: */
            Meteor.setTimeout(() => {
                console.log('%c| Session start:\t' + performance.now() + ' |', 'background: brown; color: white; font-size: 1.5em;');
                template.trial.set(0);
                template.recordEvent({timeStamp: performance.now(), type: 'session.start'});
            }, settings.session.delay);

            /** Sets timer for session duration: */
            if (settings.session.duration) {
                Meteor.setTimeout(() => {
                    const trial = template.trial.get();

                    template.recordEvent({timeStamp: performance.now(), type: 'trial.' + trial + '.end'});
                    template.recordEvent({timeStamp: performance.now(), type: 'session.end'});
                    template.clearTimers(template.timers, trial + 1);
                    FlowRouter.go('/');
                }, settings.session.delay + settings.session.duration);
            }

            template.started.set(true);
        }
    },
    trialTimers = (settings, stage, n, template) => {
        /** Sets Trial-level timers: */
        if (settings) {
            const pre = 'trial.' + n;
            if (template.timers[n] && !template.timers[n][pre + '.iti']) {

                /** Sets timer for maximum trial duration: */
                template.timers[n][pre + '.iti'] = Meteor.setTimeout(() => {
                    console.log('%c ' + pre + ' ITI end\t' + performance.now() + ' ', 'background: darkblue; color: white;');
                    return template.nextTrial(0);
                }, settings.session.iti);
                console.log('%c ' + pre + ' ITI start\t' + performance.now() + ' ', 'background: blue; color: white;');

                /** Records trial start: */
                template.recordEvent({timeStamp: performance.now(), type: pre + '.start'});
            }
        }
    };

Template.trial.helpers({
    data(settings, stage, trials) {
        if (settings) {
            const template = Template.instance(),
                i = template.trial.get(),
                n = i + 1;

            if (n > 0) {
                const id = trials[i],
                    trial = Trials.findOne(id);

                if (trial) {
                    if (!template.timers[n]) template.timers[n] = {[stage]: {}};
                    if (!template.timers[n]['trial.' + n + '.iti']) {
                        console.log('%c| trial.' + n + ' start\t' + performance.now() + ' |', 'background: black; color: white; font-size: 1.5em;');
                        trialTimers(settings, stage, n, template);
                    }

                    return trial;
                }
            }
        }
    },
    session() {
        const template = Template.instance(),
            session = template.session.get();

        if (session) {
            if (!template.started.get()) sessionTimers(session.settings, template);
            return session;
        }
    },
    stage() {
        return Template.instance().stage.get();
    },
    trial() {
        return Template.instance().trial.get();
    }
});

Template.trial.onCreated(function () {
    this.center = calculateCenter($(window).height(), $(window).width());
    this.responses = new ReactiveVar([]);
    this.session = new ReactiveVar();
    this.stage = new ReactiveVar(1);
    this.started = new ReactiveVar(false);
    this.timers = {};
    this.trial = new ReactiveVar(-1);
    this.toggles = {};

    this.clearTimers = (timers, type) => {
        const n = parseInt(type);
        if (n) _.each(_.range(n, n - 4, -1), (i) => _.each(timers[i.toString()],
            (value) => Meteor.clearTimeout(value))); else _.each(timers[type],
            (value) => Meteor.clearTimeout(value));
        //this.timers = {};
    };

    this.getSession = () => FlowRouter.getParam('session');
    this.getTrial = (number) => Trials.findOne({number: number, session: id});

    this.nextStage = (delay, increment) => {
        const stage = this.stage.get() + increment,
            trial = this.trial.get(),
            session = this.session.get();

        if (stage < session.settings.stages[trial].length) {
            return this.timers[trial][stage]['stage.' + stage + '.start'] = Meteor.setTimeout(() => {
                this.recordEvent({timeStamp: performance.now(), type: 'stage.' + stage + '.start'});
                this.stage.set(stage);
            }, delay);
        }
    };
    this.nextTrial = (delay) => {
        /** Proceed to next trial or exit: */
        const stage = this.stage.get(),
            next = this.trial.get() + 1,
            session = this.session.get();

        if (!this.timers[next][stage]['next.trial']) this.timers[next][stage]['next.trial'] = Meteor.setTimeout(() => {
            if (next <= session.trials.length) {
                this.clearTimers(this.timers, next);
                // TODO: Shutdown sequence, reset state of lights, etc.
                this.recordEvent({timeStamp: performance.now(), type: 'trial.' + next + '.end'});
                console.log('%c| trial.' + next + ' end\t' + performance.now() + ' |', 'background: darkgrey; color: white;');

                if (session.settings.session.duration || next < session.settings.stages.length) {
                    Meteor.call('addTrial', session._id, next);

                    this.responses.set([]);
                    this.stage.set(1);
                    this.trial.set(next);
                } else {
                    this.recordEvent({timeStamp: performance.now(), type: 'session.end'});
                    console.log('%c| Session end:\t' + performance.now() + ' |', 'background: brown; color: white; font-size: 1.5em;');
                    FlowRouter.go('/');
                }
            }
        }, delay);
    };

    this.recordEvent = (event) => {
        const number = this.trial.get() + 1,
            stage = this.stage.get() - 1,
            trial = this.getTrial(number);

        if (trial) Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', event);
    };

    const id = this.getSession();
    this.sessionData = () => Sessions.findOne(id);
    this.subscribe('sessions.single', id);
    this.subscribe('trials.session', id);
    this.autorun(() => {
        const session = this.sessionData();

        if (session) {
            this.subscribe('experiments.single', session.experiment);
            this.session.set(session);
        }
    });


    this.timedAudio = (audio, delay, duration, name) => {
        const stage = this.stage.get(),
            trial = this.trial.get() + 1;
        const start = name + '.start',
            stop = name + '.stop';
        console.log(trial, this.timers, start, this.responses.get());

        if (!this.timers[trial][stage][start]) {
            return Meteor.setTimeout(() => {
                this.timers[trial][stage][start] = audio.toMaster().start();
                console.log('%c🔊 ' + name + ' started\t', 'color: red; font-size: 1.5em; font-weight: 800;', performance.now());

                this.timers[trial][stage][stop] = Meteor.setTimeout(() => {
                    audio.stop();
                    this.recordEvent({timeStamp: performance.now(), type: stop});
                    console.log('%c🔊 ' + name + ' stopped\t', 'color: red; font-size: 1.5em; font-weight: 800;', performance.now());
                }, duration);

                this.recordEvent({timeStamp: performance.now(), type: start});
            }, delay, (error, response) => console.log(error, response));
        }
    };
    this.timedCommand = (device, topic, message, delay) => {
        const stage = this.stage.get(),
            timer = topic + '.' + message.command,
            trial = this.trial.get() + 1;

        return this.timers[trial][stage][timer] = Meteor.setTimeout(() => {
            const timeStamp = performance.now();
            console.log('%c💬 ' + timer + '\t', 'color: orange; font-size: 1.5em; font-weight: 800;', timeStamp);
            return Meteor.call('mqttSend', device, topic, _.extend(_.omit(message, 'delay'), {
                context: {session: id, stage: stage, time: timeStamp, trial: trial}
            }), () => this.recordEvent({timeStamp: timeStamp, type: timer + '.fired'}));
        }, delay);
    };
});

Template.trialElement.helpers({
    audio(stage, trial, i, r) {
        if (stage && trial) {
            const element = Template.currentData(),
                started = Template.instance().started.get();

            if (started !== trial) {
                Template.instance().started.set(trial);
                const name = 'audio.' + element.source.type + '.' + r + i + '.' + trial,
                    template = Template.instance().parent(3);
                let audio;

                switch (element.source.type) {
                    case 'file':
                        audio = new Tone.Player(element.file.source, () => {
                            audio.loop = true;
                            template.timedAudio(audio, element.delay, element.duration, name);
                        });
                        break;
                    case 'noise':
                        audio = new Tone.Noise(element.source.noise.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                    case 'wave':
                        audio = new Tone.OmniOscillator(element.source.wave.frequency, element.source.wave.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                }
            }
        }
    },
    center() {
        return Template.instance().parent(2).center;
    },
    command(stage, trial, i) {
        if (stage && trial) {
            const template = Template.instance().parent(3),
                session = template.session.get(),
                timers = (template.timers[trial] || {})[stage];

            if (timers) _.each(this['commands'], async (command) => {
                const event = this['type'] + '.' + command.command;

                if (!timers[event]) try {
                    const delay = command.delay + this['delay'];

                    await template.timedCommand(session.device, this['type'], command, delay);
                    template.recordEvent({
                        timeStamp: performance.now(),
                        type: this['type'] + '.' + command.command + '.sent'
                    });
                } catch (error) {
                    console.log(error);
                }
            }); // TODO: Ensure 10mL!
        }
    },
    stage() {
        return Template.instance().parent(3).stage.get();
    },
    timer(delay, duration, type, i) {
        const template = Template.instance().parent(3),
            stage = template.stage.get(),
            trial = template.trial.get() + 1,
            name = type + '.' + i;

        if (!template.timers[trial][stage][name + '.start']) {
            template.timers[trial][stage][name + '.start'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.start'});
                template.toggles[name] = true;
                console.log('%c⏳ ' + name + ' start\t', 'color: purple; font-size: 1.5em; font-weight: 800;', performance.now());
            }, delay);

            template.timers[trial][stage][name + '.end'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: name + '.end'});
                template.toggles[name] = false;
                console.log('%c⌛ ' + name + ' end\t', 'color: purple; font-size: 1.5em; font-weight: 800;', performance.now());
            }, delay + duration);
        }

        return template.toggles[name];
    },
    trial() {
        return Template.instance().parent(3).trial.get() + 1;
    }
});

Template.trialElement.onCreated(function () {
    this.started = new ReactiveVar(0);
});

Template.trialElements.helpers({
    responses() {
        return Template.instance().parent(2).responses.get();
    }
});

Template.trialElements.onRendered(function () {
    console.log('%c Trial Elements render:\t' + performance.now() + ' ', 'background: darkgrey; color: white;');
});

Template.trialSVG.events({
    'click'(e, svg) {
        const data = Template.currentData(),
            event = collectClickEvent(e),
            template = svg.parent(),
            stage = data.stage - 1,
            trial = data.trial.number - 1;

        console.log("TEST", template.timers, data.trial.number, data.stage, event);
        console.log(!_.has(template.timers[data.trial.number][data.stage], "next.trial"), performance.now());
        // if (!_.has(template.timers[data.trial.number][data.stage], "next.trial")) {
        const session = template.session.get(),
            variables = {
                'center': (p) => (template.center[p]),
                'event': (p) => (event[p]),
                'insert': (d, s, t) => {
                    const responses = template.responses.get();
                    if (!_.has(responses, t)) responses.push(t); // May conflict w/later experiment types
                    console.log(t, responses, _.has(responses, t));
                    template.responses.set(responses);
                },
                'number': (n) => (parseFloat(n)),
                'stage': (d, n) => template.nextStage(d, n),
                'stimuli': (p) => {
                    let elements = _.filter(session.settings.stages[trial][stage],
                        (element) => (element.type === 'stimuli'));

                    _.each(p.split('.'), (value) => {
                        if (elements) elements = elements[value];
                    });

                    return elements;
                },
                'trial': (d, n) => template.nextTrial(d),
                '<': (o, s) => (o < s),
                '+': (d, s, t) => variables[t](d, s.amount),
                '=': (o, s) => (o === s)
            };

        _.each(session.settings.inputs[stage], (input) => {
            if (input.event === event.type) {
                const correct = conditionsMet(input, variables);
                _.each((correct) ? input.correct : input.incorrect, (action) =>
                    _.each(action.targets, (target) =>
                        variables[action.action](action.delay, action.specifications, target)));
            }
        });
        // }

        template.recordEvent(event);
    }
});

Template.trialSVG.helpers({
    elements(stage, trial) {
        if (trial && stage) return trial.stages[stage - 1];
    },
    ir(stage, trial) {
        const template = Template.instance(),
            triggered = template.triggered.get();
        if (!triggered) {
            const entry = _.some(trial.data[stage - 1], (element) => (element.request && element.request.ir === 'entry'));
            console.log('%c⚡ trial.' + trial.number + ':\t 1st IR entry', 'color:red;', performance.now());

            const parent = template.parent();
            parent.clearTimers(parent.timers, trial.number);
            parent.nextTrial(20000);
            template.triggered.set(true);
        }

    }
});

Template.trialSVG.onCreated(function () {
    this.triggered = new ReactiveVar(false);
});

Template.trialSVG.onRendered(function () {
    console.log('%c Trial SVG renders:\t' + performance.now() + ' ', 'background: darkgrey; color: white;');
});
