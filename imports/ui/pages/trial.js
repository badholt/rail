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
        } :
        (value instanceof Window) ? 'Window' : value, ' ')),
    conditionsMet = (input, variables) => _.every(input.conditions, (condition) =>
        _.every(condition.objects, (object) => {
            const o = variables[object.name](object.property);

            return _.every(condition.subjects, (subject) => {
                const s = variables[subject.name](subject.property);
                return variables[condition.comparison](o, s);
            });
        }));

Template.trial.events({
    'click'(e, template) {
        const event = collectClickEvent(e),
            session = template.session.get(),
            stage = template.stage.get() - 1,
            number = template.trial.get() - 1,
            variables = {
                'center': (p) => (template.center[p]),
                'event': (p) => (event[p]),
                'insert': (d, s, t) => {
                    const responses = template.responses.get();
                    responses.push(t);
                    console.log(d, s, t, responses);
                    template.responses.set(responses);
                },
                'number': (n) => (parseFloat(n)),
                'stage': (d, n) => template.nextStage(d, n),
                'stimuli': (p) => {
                    let elements = _.filter(session.settings.stages[number][stage],
                        (element) => (element.type === 'stimuli'));

                    _.each(p.split('.'), (value) => {
                        if (elements) elements = elements[value];
                    });

                    return elements;
                },
                'trial': (d, n) => template.nextTrial(d, n),
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
    trial(trials) {
        const number = Template.instance().trial.get(),
            id = trials[number],
            trial = Trials.findOne(id);

        console.log('trial:\n', this, number, id, trial);
        if (trial) return trial;
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

    this.clearTimers = (timers) => {
        _.each(timers, (value) => Meteor.clearTimeout(value));
        this.timers = {};
    };
    this.getSession = () => FlowRouter.getParam('session');
    this.nextStage = (delay, number) => this.timers['stage'] = Meteor.setTimeout(() => {
        const value = this.stage.get() + number;
        this.recordEvent({timeStamp: performance.now(), type: 'stage.' + value + '.start'});
        this.stage.set(value);
    }, delay);
    this.nextTrial = (delay, increment) => Meteor.setTimeout(() => {
        /** Proceed to next trial or exit: */
        const number = this.trial.get(),
            next = number + 1,
            session = this.session.get();

        console.log(this.timers);
        this.clearTimers(this.timers);
        // TODO: Shutdown sequence, reset state of lights, etc.
        this.recordEvent({timeStamp: performance.now(), type: 'trial.' + number + '.end'});
        console.log('NEXT:\t', this.timers, number, next, session);

        if (session.settings.session.duration || number < session.settings.stages.length) {
            Meteor.call('addTrial', session._id, next, (error, response) => {
                console.log(error, response);
            });

            this.responses.set([]);
            this.stage.set(1);
            this.trial.set(next);
            console.log(number, next, increment, this.trial.get());
        } else {
            this.recordEvent({timeStamp: performance.now(), type: 'session.end'});
            FlowRouter.go('/');
        }
    }, delay);
    this.recordEvent = (event) => {
        const number = this.trial.get(),
            stage = this.stage.get() - 1,
            trial = this.getTrial(number);

        if (trial) Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', event);
    };
    this.sessionData = () => Sessions.findOne(id);
    // TODO: Add data updates to each trial for firing events
    this.timedAudio = (audio, delay, duration, name) => Meteor.setTimeout(() => {
        const start = name + '.start',
            stop = name + '.stop';

        if (!this.timers[start]) {
            this.timers[start] = audio.start(); //TODO: Find way to store actual handle
            this.recordEvent({timeStamp: performance.now(), type: start});
        }

        if (!this.timers[stop]) this.timers[stop] = Meteor.setTimeout(() => {
            audio.stop();
            this.recordEvent({timeStamp: performance.now(), type: stop});
        }, duration);

        console.log(name, this.timers);
    }, delay, (error, response) => console.log(error, response));
    this.timedCommand = (device, topic, message, delay) => {
        const timer = topic + '.' + message.command;
        return this.timers[timer] = Meteor.setTimeout(() => Meteor.call('mqttSend', device, topic, message,
            () => this.recordEvent({timeStamp: performance.now(), type: timer + '.fired'})), delay);
    };

    const id = this.getSession();
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
    audio(element) {
        console.log('audio:\n', this, element);
        const template = Template.instance().parent(3),
            name = 'audio.' + element.file.name + '.' + template.trial.get(),
            audio = new Tone.Player(element.file.source, () => {
                audio.loop = true;
                template.timedAudio(audio, element.delay, element.duration, name);
            }).toMaster();
        // osc = new Tone.Oscillator(600, "sine", () => {
        //     template.timedAudio(osc, element.delay, element.duration);
        // }).toMaster();

        // template.timedAudio(osc, element.delay, element.duration);
        console.log('audio:\t', this, '\ntemplate:\t', template);
    },
    center() {
        return Template.instance().parent(2).center;
    },
    command(data) {
        const template = Template.instance().parent(3),
            session = template.session.get();

        _.each(data.commands, async (command) => {
            if (!template.timers[data.type + '.' + command.command]) try {
                await template.timedCommand(session.device, data.type, command, command.delay + data.delay);

                template.recordEvent({
                    timeStamp: performance.now(),
                    type: data.type + '.' + command.command + '.sent'
                });
            } catch (error) {
                console.log(error);
            }
        }); // TODO: Ensure 10mL!
    },
    timer(delay, duration, type) {
        const template = Template.instance().parent(3);

        if (!template.timers[type + '.start']) {
            template.timers[type + '.start'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.start'});
                template.toggles[type] = true;
            }, delay);

            template.timers[type + '.end'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.end'});
                template.toggles[type] = false;
            }, delay + duration);
        }

        // console.log(performance.now(), template.toggles[type]);
        return template.toggles[type];
    }
});

Template.trialElement.onRendered(function () {
    console.log('element rendered:\t', this.data);
});

Template.trialElements.helpers({
    responses() {
        return Template.instance().parent(2).responses.get();
    }
});

Template.trialElements.onRendered(function () {
    const template = this.parent(2),
        session = template.session.get(),
        trial = template.trial.get();

    /** Sets Trial-level timers: */
    if (session.settings) {
        const pre = 'trial.' + trial;

        console.log(!template.timers[pre + '.iti'], template.timers);

        if (!template.timers[pre + '.iti']) {
            /** Sets timer for maximum trial duration: */
            template.timers[pre + '.iti'] = Meteor.setTimeout(() => {
                console.log(pre + ' ITI just ENDED');
                return template.nextTrial(0, 1);
            }, session.settings.session.iti);

            /** Records trial start: */
            template.recordEvent({timeStamp: performance.now(), type: pre + '.start'});
        }
    }
    console.log(trial, template.trial.get());
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
    console.log(this, template, session, trial);

    /** Sets Session-level timers: */
    if (session.settings) {
        /** Delays onset of first trial: */
        Meteor.setTimeout(() => {
            template.recordEvent({timeStamp: performance.now(), type: 'session.start'});
        }, session.settings.session.delay);

        /** Sets timer for session duration: */
        if (session.settings.session.duration) {
            Meteor.setTimeout(() => {
                template.recordEvent({
                    timeStamp: performance.now(),
                    type: 'trial.' + template.trial.get() + '.end'
                });
                template.recordEvent({timeStamp: performance.now(), type: 'session.end'});
                template.clearTimers(template.timers);
                FlowRouter.go('/');
            }, session.settings.session.delay + session.settings.session.duration);
        }
    }
});
