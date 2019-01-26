import './trial.html';

import '/imports/ui/components/audio';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import _ from 'underscore';

import {calculateCenter} from '../../api/client.methods';
import {Experiments, Sessions, Trials} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Howl} from "howler";
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

export const collectEvent = (e) => JSON.parse(JSON.stringify(_.pick(e, 'clientX', 'clientY',
    'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'), (key, value) =>
        (value instanceof Node) ? {
                classes: value.classList,
                id: value.id,
                parent: {
                    classes: value.parentNode.classList,
                    id: value.parentNode.id
                }
            }
            : (value instanceof Window) ? 'Window' : value, ' ')),
    correctEvent = (center, e, settings, visuals) => {
        let correct = true;

        _.each(settings, (visual) => _.each(visual.correct, (element) => {
            const conditions = _.omit(element, 'event', 'stimulus'),
                event = element.event,
                stimulus = visuals[element.stimulus],
                match = _.every(conditions, (value, key) => _.isEqual(stimulus[key], value));

            if (match) {
                const answer = (center.x < e.clientX) ? 'right' : 'left';
                correct = (event === answer);
            }
        }));

        console.log(correct);
        return correct;
    };

Template.trial.events({
    'click #fixation-cross'(e, template) {
        const session = template.session(),
            number = template.trial.get(),
            stage = template.stage.get();
        console.log(this, template);

        // template.timer.delay = Meteor.setTimeout(() => {
        //     console.log('DELAY!');
        //     //FlowRouter.go('/' + session._id + '/trial/' + number + '/stage/' + 2);
        //     template.stage.set(stage + 1);
        //     template.timer.duration = Meteor.setTimeout(() => {
        //         console.log('DURATION!');
        //         Meteor.call('updateTrial', number, {type: 'duration', timeStamp: Date.now()}, session._id, stage);
        //         $('svg .bar').attr('opacity', 0);
        //         if (number < session.settings.length) {
        //             // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
        //             Meteor.call('addTrial', session._id, (number + 1));
        //             template.trial.set(number + 1);
        //             // FlowRouter.go('/' + session._id + '/trial/' + (number + 1) + '/stage/' + 1);
        //         } else {
        //             FlowRouter.go('/');
        //         }
        //     }, duration);
        // }, delay);
    },
    'click'(e, template) {
        /** Record trial events: */
        const answered = template.answered.get(),
            center = template.center,
            event = collectEvent(e),
            session = template.session(),
            stage = parseInt(template.stage.get()) - 1,
            number = template.trial.get(),
            trial = template.trials(number, session._id);

        if (!answered) if (stage < 2) {
            template.timedIncrement('stage', 0, 1);
        } else {
            // TODO: Check if correct - for now every click is correct!
            template.nextTrial(number, session);
        }

        /** Update Trial record with data of response to stimuli: */
        // Meteor.call('updateTrial', number, event, session._id, stage);

        // if (!answered) if (stage !== 0) {
        //     /** To which stimulus should the subject attend and respond? */
        //     // if (correctEvent(center, e, session.settings[number - 1][stage], trial.stages[stage].visuals)) {
        //     template.audio.beep.play();
        //
        //     template.timedCommand(session.device, 'lights', {command: 'off', numbers: [1]}, 1000);
        //     template.timedCommand(session.device, 'reward', {command: 'turnOff'}, 1000);
        //
        //     Meteor.setTimeout(() => {
        //         template.timedCommand(session.device, 'lights', {command: 'off', numbers: [1]}, 1000);
        //         template.timedCommand(session.device, 'reward', {command: 'turnOff'}, 1000);
        //     }, 1000); //TODO: Ensure 10mL!
        //
        //     Meteor.setTimeout(() => nextTrial(number, session, template), 10000);
        //     // } else {
        //     //     template.timedCommand(session.device, 'lights', {command: 'on', numbers: [3, 5]}, 1000);
        //     //     Meteor.setTimeout(() => nextTrial(number, session, template), 1000);
        //     // }
        //
        //     template.answered.set(true);
        // }

        console.log(stage, answered, number, trial, this, template);
    }
});

Template.trial.helpers({
    audio() {
        const audio = new Howl({
            loop: this.loop,
            src: [this.file.source],
            onplayerror: () => {
                audio.once('unlock', () => audio.play());
            }
        });

        Template.instance().timedAudio(audio, this.delay, this.duration);
    },
    center() {
        console.log(Template.instance.center());
    },
    command() {
        const data = Template.currentData(),
            template = Template.instance(),
            session = template.session();

        _.each(data.commands, (command) => template.timedCommand(session.device, data.type, command, data.delay));
        // TODO: Ensure 10mL!
    },
    session() {
        return Sessions.findOne(Template.instance().getSession());
    },
    stage(stages) {
        const stage = Template.instance().stage.get() - 1;
        return stages[stage];
    },
    trial(session) {
        const template = Template.instance(),
            number = template.trial.get();

        template.timers['iti'] = Meteor.setTimeout(() =>
            template.nextTrial(number, session), session.settings.session.iti);

        return template.trials(number, session._id);
    }
});

Template.trial.onCreated(function () {
    this.answered = new ReactiveVar(false);
    this.clearTimers = (timers) => {
        _.each(timers, (value) => Meteor.clearTimeout(value));
        this.timers = {};
    };
    this.getExperiment = (session) => {
        if (session && session.experiment) return session.experiment;
    };
    this.getSession = () => FlowRouter.getParam('session');

    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
    });

    this.autorun(() => {
        this.experiment = (trial) => {
            if (trial && trial.experiment) return Experiments.findOne(trial.experiment);
        };
        this.session = () => Sessions.findOne(this.getSession());
        this.trials = (number, session) => Trials.findOne({number: number, session: session});
    });

    this.autorun(() => {
        this.subscribe('experiments.single', this.getExperiment(this.session()));
        this.subscribe('sessions.single', this.getSession());
        this.subscribe('trials.single', this.getSession());
    });

    this.nextTrial = (number, session) => {
        this.clearTimers(this.timers);

        /** Proceed to next trial or exit: */
        const next = number + 1;
        console.log(number, next, performance.now());

        if (number < session.settings.stages.length) {
            Meteor.call('addTrial', session._id, next);
            this.answered.set(false);
            this.stage.set(1);
            this.trial.set(next);
        } else {
            FlowRouter.go('/');
        }
    };

    this.stage = new ReactiveVar(1);
    this.trial = new ReactiveVar(1);

    this.timers = {};
    this.timedAudio = (audio, delay, duration) =>
        audio.once('unlock', () => Meteor.setTimeout(() => {
            audio.play();
            Meteor.setTimeout(() => audio.stop(), duration);
        }, delay));
    this.timedCommand = (device, topic, message, delay) => this.timers[topic] = Meteor.setTimeout(() => {
        console.log(device, topic, message, delay);
        return Meteor.call('mqttSend', device, topic, message);
    }, delay);
    this.timedIncrement = (variable, delay, difference) => this.timers[variable] = Meteor.setTimeout(() => {
        const value = this[variable].get() + difference;
        this[variable].set(value);
    }, delay);
});
