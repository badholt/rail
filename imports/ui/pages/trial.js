import './trial.html';
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

export const collectEvent = (e) => JSON.parse(JSON.stringify(_.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY',
    'target', 'type', 'which'), (key, value) => (value instanceof Node)
    ? {
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
    },
    nextTrial = (number, session, template) => {
        _.each(template.timer, (value) => Meteor.clearTimeout(value));

        /** Proceed to next trial or exit: */
        const next = (template.secondChance.get()) ? number : number + 1;
        if (number < session.settings.length) {
            // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
            Meteor.call('addTrial', next, session._id);
            FlowRouter.go('/' + session._id + '/trial/' + next + '/stage/' + 1);
        } else {
            FlowRouter.go('/');
        }

        template.answered.set(false);
    };

Template.trial.events({
    'click #fixation-cross.responsive'(e, template) {
        const session = template.session(),
            number = template.trial().number,
            stage = template.getStage(),
            delay = session.settings[number - 1][stage][0].delay,
            duration = session.settings[number - 1][stage][0].duration;
        console.log(delay, duration);

        template.timer.delay = Meteor.setTimeout(() => {
            console.log('DELAY!');
            FlowRouter.go('/' + session._id + '/trial/' + number + '/stage/' + 2);
            template.timer.duration = Meteor.setTimeout(() => {
                console.log('DURATION!');
                Meteor.call('updateTrial', number, {type: 'duration', timeStamp: Date.now()}, session._id, stage);
                $('svg .bar').attr('opacity', 0);
                // if (number < session.settings.length) {
                //     // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
                //     Meteor.call('addTrial', (number + 1), session._id);
                //     FlowRouter.go('/' + session._id + '/trial/' + (number + 1) + '/stage/' + 1);
                // } else {
                //     FlowRouter.go('/');
                // }
            }, duration);
        }, delay);
    },
    'click'(e, template) {
        /** Record trial events: */
        const answered = template.answered.get(),
            center = template.center,
            event = collectEvent(e),
            multiAnswer = template.multiAnswer.get(),
            session = template.session(),
            stage = parseInt(template.getStage()) - 1,
            trial = template.trial();
        let number = trial.number;

        /** Update Trial record with data of response to stimuli: */
        Meteor.call('updateTrial', number, event, session._id, stage);

        if (multiAnswer || !answered) {
            /** Handle events during stimuli presentation: */
            if (stage !== 0) {
                /** To which stimulus should the subject attend and respond? */
                if (correctEvent(center, e, session.settings[number - 1][stage], trial.stages[stage].visuals)) {
                    template.audio.beep.play();

                    Meteor.call('mqttSend', session.device, 'reward', {command: 'turnOn'});
                    Meteor.setTimeout(() => {
                        Meteor.call('mqttSend', session.device, 'reward', {command: 'turnOff'});
                    }, 1000); //TODO: Ensure 10mL!
                    Meteor.setTimeout(() => {
                        nextTrial(number, session, template);
                    }, 10000);
                } else {
                    Meteor.call('mqttSend', session.device, 'led1', {command: 'turnOn'});
                    Meteor.call('mqttSend', session.device, 'led2', {command: 'turnOn'});
                    Meteor.setTimeout(() => {
                        Meteor.call('mqttSend', session.device, 'led1', {command: 'turnOff'});
                        Meteor.call('mqttSend', session.device, 'led2', {command: 'turnOff'});
                        nextTrial(number, session, template);
                    }, trial.stages[stage].visuals[0].light);
                }
                template.answered.set(true);
            }
        }
    }
});

Template.trial.helpers({
    crossSettings(stage) {
        const settings = (this.stages) ? this.stages[stage].visuals[0].cross : '',
            cross = (stage === 0) ? 'responsive visible' : 'invisible',
            region = (stage === 0) ? 'responsive' : 'unresponsive';

        return _.extend(settings, {cross: cross, region: region});
    },
    stimuli(stage) {
        if (stage === 1) {
            const trial = Template.instance().trial();
            if (trial && trial.stages[stage]) return trial.stages[stage].visuals;
        }
    },
    stage() {
        return parseInt(Template.instance().stage()) - 1;
    },
    trial() {
        return Template.instance().trial();
    }
});

Template.trial.onCreated(function () {
    this.audio = {
        beep: new Howl({
            preload: true,
            src: ['/audio/beep.wav']
        }),
        long: new Howl({
            preload: true,
            src: ['/audio/beep_long.mp3']
        })
    };
    this.answered = new ReactiveVar(false);
    this.getSession = () => FlowRouter.getParam('session');
    this.getStage = () => FlowRouter.getParam('stage');
    this.getTrial = () => parseInt(FlowRouter.getParam('trial'));

    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
        this.getExperiment = (session) => {
            if (session && session.experiment) return session.experiment;
        };
        this.experiment = (trial) => {
            if (trial && trial.experiment) return Experiments.findOne(trial.experiment);
        };
        this.session = () => {
            return Sessions.findOne(this.getSession());
        };
        this.stage = () => {
            return this.getStage();
        };
        this.trial = () => {
            return Trials.findOne({number: this.getTrial(), session: this.getSession()});
        };

        this.subscribe('experiments.single', this.getExperiment(this.session()));
        this.subscribe('sessions.single', this.getSession());
        this.subscribe('trials.single', this.getSession());
    });

    this.length = this.session().settings.length;
    this.multiAnswer = new ReactiveVar(false);
    this.secondChance = new ReactiveVar(false);
});

Template.trial.onRendered(function () {
    const template = Template.instance(),
        number = template.getTrial(),
        session = template.session(),
        stage = template.getStage(),
        iti = session.settings[number - 1][stage][0].iti;

    console.log(number, stage, iti);

    template.timer = {
        delay: '',
        duration: '',
        iti: Meteor.setTimeout(() => {
            console.log('ITI!');
            Meteor.call('updateTrial', number, {type: 'iti', timeStamp: Date.now()}, session._id, stage);
            if (number < session.settings.length) {
                // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
                Meteor.call('addTrial', (number + 1), session._id);
                FlowRouter.go('/' + session._id + '/trial/' + (number + 1) + '/stage/' + stage);
            } else {
                FlowRouter.go('/');
            }
        }, iti)
    };
});
