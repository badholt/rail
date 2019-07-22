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
    _.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'), (key, value) =>
        (value instanceof Node) ? {
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
        }));

Template.trial.events({
    'click'(e, template) {
        const event = collectClickEvent(e),
            session = template.sessionData(),
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
    audio(element) {
        console.log(this, element);
        const template = Template.instance(),
            audio = new Tone.Player(element.file.source, () => {
                audio.loop = true;
                template.timedAudio(audio, element.delay, element.duration);
            }).toMaster();
        // osc = new Tone.Oscillator(600, "sine", () => {
        //     template.timedAudio(osc, element.delay, element.duration);
        // }).toMaster();

        // template.timedAudio(osc, element.delay, element.duration);
        console.log(element);
    },
    center() {
        return Template.instance().center;
    },
    command(data) {
        const template = Template.instance(),
            session = template.sessionData();

        _.each(data.commands, async (command) => {
            if (!template.timers[data.type + '.' + command.command]) try {
                await template.timedCommand(session.device, data.type, command, command.delay + data.delay);
                template.recordEvent({type: data.type + '.' + command.command + '.sent'});
            } catch (error) {
                console.log(error);
            }
        }); // TODO: Ensure 10mL!
    },
    responses() {
        return Template.instance().responses.get();
    },
    session() {
        return Template.instance().sessionData();
    },
    stage(stages) {
        const template = Template.instance(),
            number = template.trial.get(),
            session = template.sessionData(),
            stage = template.stage.get() - 1;

        console.log(stages, stage, stages[stage], this);

        if (!template.timers['session.iti']) {
            template.recordEvent({type: 'trial.' + number + '.start'});
            template.timers['session.iti'] = Meteor.setTimeout(() =>
                template.nextTrial(0, number), session.settings.session.iti);
        }

        return stages[stage];
    },
    timer(delay, duration, type) {
        const template = Template.instance();

        if (!template.timers[type + '.start']) {
            template.timers[type + '.start'] = Meteor.setTimeout(() => {
                template.recordEvent({type: type + '.start'});
                template.toggles[type] = true;
            }, delay);

            template.timers[type + '.end'] = Meteor.setTimeout(() => {
                template.recordEvent({type: type + '.end'});
                template.toggles[type] = false;
            }, delay + duration);
        }

        // console.log(performance.now(), template.toggles[type]);
        return template.toggles[type];
    },
    trial() {
        const template = Template.instance(),
            number = template.trial.get();

        return template.getTrial(number);
    }
});

Template.trial.onCreated(function () {
    this.center = calculateCenter($(window).height(), $(window).width());
    this.clearTimers = (timers) => {
        _.each(timers, (value) => Meteor.clearTimeout(value));
        this.timers = {};
    };
    this.getSession = () => FlowRouter.getParam('session');

    const id = this.getSession();
    this.sessionData = () => Sessions.findOne(id);

    this.autorun(() => {
        this.getTrial = (number) => Trials.findOne({number: number, session: id});

        const session = this.sessionData();
        if (session) this.subscribe('experiments.single', session.experiment);

        this.subscribe('sessions.single', id);
        this.subscribe('trials.session', id);
    });

    this.nextStage = (delay, number) => this.timers['stage'] = Meteor.setTimeout(() => {
        const value = this.stage.get() + number;
        this.recordEvent({type: 'stage.' + value + '.start'});
        this.stage.set(value);
    }, delay);
    this.nextTrial = (delay, increment) => Meteor.setTimeout(() => {
        /** Proceed to next trial or exit: */
        const number = this.trial.get(),
            next = number + 1,
            session = this.sessionData();
        console.log(number, next, increment);

        if (session.settings.session.duration || number < session.settings.stages.length) {
            // TODO: Shutdown sequence, reset state of lights, etc.
            this.recordEvent({type: 'trial.' + number + '.end'});
            this.clearTimers(this.timers);
            this.responses.set([]);

            Meteor.call('addTrial', session._id, next);

            this.stage.set(1);
            this.trial.set(next);
            this.recordEvent({type: 'trial.' + next + '.start'});
        } else {
            this.recordEvent({type: 'session.end'});
            FlowRouter.go('/');
        }
    }, delay);

    this.responses = new ReactiveVar([]);
    this.stage = new ReactiveVar(1);
    this.trial = new ReactiveVar(0);
    this.timers = {};
    this.toggles = {};

    this.recordEvent = (event) => {
        const data = _.extend(event, {date: new Date(), timeStamp: performance.now()}),
            number = this.trial.get(),
            stage = this.stage.get() - 1,
            trial = this.getTrial(number);

        if (trial) Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', data);
    };

    // TODO: Add data updates to each trial for firing events
    this.timedAudio = (audio, delay, duration) => Meteor.setTimeout(() => {
        if (!this.timers['audio.start']) {
            this.timers['audio.start'] = audio.start();
            this.recordEvent({type: 'audio.start'});
        }

        if (!this.timers['audio.stop']) this.timers['audio.stop'] = Meteor.setTimeout(() => {
            audio.stop();
            this.recordEvent({type: 'audio.stop'});
        }, duration);
    }, delay);
    this.timedCommand = (device, topic, message, delay) => {
        const timer = topic + '.' + message.command;
        return this.timers[timer] = Meteor.setTimeout(() => Meteor.call('mqttSend', device, topic, message,
            () => this.recordEvent({type: timer + '.fired'})), delay);
    };
});

Template.trial.onRendered(function () {
    const session = this.sessionData();

    Meteor.setTimeout(() => {
        this.trial.set(1);
        this.recordEvent({type: 'session.start'});
    }, session.settings.session.delay);

    if (session.settings.session.duration) {
        Meteor.setTimeout(() => {
            this.recordEvent({type: 'trial.' + this.trial.get() + '.end'});
            this.recordEvent({type: 'session.end'});
            this.clearTimers(this.timers);
            FlowRouter.go('/');
        }, session.settings.session.delay + session.settings.session.duration);
    }
});
