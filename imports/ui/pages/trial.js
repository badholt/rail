import './trial.html';

import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import _ from 'underscore';
import Tone from 'tone';

import {calculateCenter} from '../../api/client.methods';
import {Sessions, Trials} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
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
    trialTimers = (settings, stage, n, template) => {
        /** Sets Trial-level timers: */
        if (settings) {
            const pre = 'trial.' + n;
            if (template.timers[n] && !template.timers[n][pre + '.iti']) {

                /** Sets timer for maximum trial duration: */
                template.timers[n][pre + '.iti'] = Meteor.setTimeout(() => {
                    console.log(pre + ' ITI just ENDED');
                    return template.nextTrial(0);
                }, settings.session.iti);

                /** Records trial start: */
                template.recordEvent({timeStamp: performance.now(), type: pre + '.start'});
            }
        }
    };

Template.trial.events({
    'click'(e, template) {
        const event = collectClickEvent(e),
            session = template.session.get(),
            stage = template.stage.get() - 1,
            trial = template.trial.get(),
            variables = {
                'center': (p) => (template.center[p]),
                'event': (p) => (event[p]),
                'insert': (d, s, t) => {
                    const responses = template.responses.get();
                    responses.push(t);
                    console.log('RESPONSES:\n', d, s, t, responses);
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

        template.recordEvent(event);
    }
});

Template.trial.helpers({
    session() {
        return Template.instance().session.get();
    },
    stage() {
        return Template.instance().stage.get();
    },
    trial(settings, stage, trials) {
        const template = Template.instance(),
            n = template.trial.get() + 1,
            id = trials[n - 1],
            trial = Trials.findOne(id);

        if (trial) {
            if (!template.timers[n]) template.timers[n] = {[stage]: {}};
            if (!template.timers[n]['trial.' + n + '.iti']) {
                trialTimers(settings, stage, n, template);
                console.log('new trial', n, template.timers);
            }
            return trial;
        }
    }
});

Template.trial.onCreated(function () {
    this.center = calculateCenter($(window).height(), $(window).width());
    this.responses = new ReactiveVar([]);
    this.session = new ReactiveVar();
    this.stage = new ReactiveVar(1);
    this.timers = {};
    this.trial = new ReactiveVar(0);
    this.toggles = {};

    this.clearTimers = (timers, type) => {
        _.each(timers[type], (value) => Meteor.clearTimeout(value));
        // this.timers = {};
    };
    this.getSession = () => FlowRouter.getParam('session');
    this.nextStage = (delay, increment) => {
        const stage = this.stage.get() + increment,
            trial = this.trial.get() + 1;

        return this.timers[trial][stage]['stage.' + stage + '.start'] = Meteor.setTimeout(() => {
            this.recordEvent({timeStamp: performance.now(), type: 'stage.' + stage + '.start'});
            this.stage.set(stage);
        }, delay);
    };
    this.nextTrial = (delay) => Meteor.setTimeout(() => {
        /** Proceed to next trial or exit: */
        const n = this.trial.get() + 1,
            session = this.session.get();

        this.clearTimers(this.timers, n);
        // TODO: Shutdown sequence, reset state of lights, etc.
        this.recordEvent({timeStamp: performance.now(), type: 'trial.' + n + '.end'});
        console.log('NEXT:\t', n);

        if (session.settings.session.duration || n < session.settings.stages.length) {
            Meteor.call('addTrial', session._id, n);

            this.responses.set([]);
            this.stage.set(1);
            this.trial.set(n);
        } else {
            this.recordEvent({timeStamp: performance.now(), type: 'session.end'});
            FlowRouter.go('/');
        }
    }, delay);
    this.recordEvent = (event) => {
        const number = this.trial.get() + 1,
            stage = this.stage.get() - 1,
            trial = this.getTrial(number);

        if (trial) Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', event);
    };
    this.sessionData = () => Sessions.findOne(id);
    // TODO: Add data updates to each trial for firing events
    this.timedAudio = (audio, delay, duration, name) => {
        const stage = this.stage.get(),
            trial = this.trial.get() + 1;

        return Meteor.setTimeout(() => {
            const start = name + '.start',
                stop = name + '.stop';

            this.timers[trial][stage][start] = audio.toMaster().start();
            this.timers[trial][stage][stop] = Meteor.setTimeout(() => {
                audio.stop();
                this.recordEvent({timeStamp: performance.now(), type: stop});
            }, duration);

            this.recordEvent({timeStamp: performance.now(), type: start});
        }, delay, (error, response) => console.log(error, response));
    };
    const id = this.getSession();

    this.timedCommand = (device, topic, message, delay) => {
        const stage = this.stage.get(),
            timer = topic + '.' + message.command,
            trial = this.trial.get() + 1;

        return this.timers[trial][stage][timer] = Meteor.setTimeout(() => {
            const timeStamp = performance.now();
            return Meteor.call('mqttSend', device, topic, _.extend(message, {
                context: {session: id, stage: stage, time: timeStamp, trial: trial}
            }), () => this.recordEvent({timeStamp: timeStamp, type: timer + '.fired'}));
        }, delay);
    };

    this.autorun(() => {
        this.getTrial = (number) => Trials.findOne({number: number, session: id});

        this.subscribe('sessions.single', id);
        this.subscribe('trials.session', id);
    });
    this.autorun(() => {
        const session = this.sessionData();

        this.session.set(session);
        if (session) this.subscribe('experiments.single', session.experiment);
    });
});

Template.trialElement.helpers({
    audio(element, stage, trial) {
        if (element && stage && trial) {
            const template = Template.instance().parent(3),
                timers = (template.timers[trial] || {})[stage],
                name = 'audio.' + ((element.file || {})['name'] || (element.noise || element.wave)['type']) + '.' + trial;

            if (timers && !timers[name + '.start']) {
                const types = ['file', 'noise', 'wave'],
                    type = _.find(_.keys(element), (v) => _.contains(types, v));

                let audio;
                switch (type) {
                    case 'file':
                        audio = new Tone.Player(element.file.source, () => {
                            audio.loop = true;
                            template.timedAudio(audio, element.delay, element.duration, name);
                        });
                        break;
                    case 'noise':
                        audio = new Tone.Noise(element.noise.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                    case 'wave':
                        audio = new Tone.OmniOscillator(element.wave.frequency, element.wave.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                }
            }
        }
    },
    center() {
        return Template.instance().parent(2).center;
    },
    command(stage, trial) {
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
    timer(delay, duration, type) {
        const template = Template.instance().parent(3),
            stage = template.stage.get(),
            trial = template.get();

        if (!template.timers[trial][stage][type + '.start']) {
            template.timers[trial][stage][type + '.start'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.start'});
                template.toggles[type] = true;
            }, delay);

            template.timers[trial][stage][type + '.end'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.end'});
                template.toggles[type] = false;
            }, delay + duration);
        }

        return template.toggles[type];
    },
    trial() {
        return Template.instance().parent(3).trial.get() + 1;
    }
});

Template.trialElements.helpers({
    responses() {
        return Template.instance().parent(2).responses.get();
    }
});

Template.trialSVG.helpers({
    elements(trial, stage) {
        if (trial) return trial.stages[stage - 1];
    }
});

Template.trialSVG.onRendered(function () {
    const template = this.parent(),
        session = template.session.get(),
        trial = template.trial.get();

    /** Sets Session-level timers: */
    if (session.settings) {
        /** Delays onset of first trial: */
        Meteor.setTimeout(() => {
            template.recordEvent({timeStamp: performance.now(), type: 'session.start'});
        }, session.settings.session.delay);

        /** Sets timer for session duration: */
        if (session.settings.session.duration) {
            Meteor.setTimeout(() => {
                const trial = template.trial.get();

                template.recordEvent({timeStamp: performance.now(), type: 'trial.' + trial + '.end'});
                template.recordEvent({timeStamp: performance.now(), type: 'session.end'});
                template.clearTimers(template.timers, trial);
                FlowRouter.go('/');
            }, session.settings.session.delay + session.settings.session.duration);
        }
    }
});
