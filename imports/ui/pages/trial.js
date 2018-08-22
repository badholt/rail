import './trial.html';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import {calculateCenter} from '../../api/client.methods';
import {Experiments, Sessions, Trials} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Howl} from "howler";
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

const collectEvent = (e) =>
        JSON.stringify(_.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
            function (key, value) {
                return (value instanceof Node) ? {
                    classes: value.classList,
                    id: value.id,
                    parent: {
                        classes: value.parentNode.classList,
                        id: value.parentNode.id
                    }
                } : (value instanceof Window) ? 'Window' : value;
            }, ' '),
    correctEvent = (center, e, visuals) => {
        if (visuals) {
            const answer = (center.x < e.clientX) ? 90 : 0;
            return (visuals.orientation.value === answer);
        }
    };

Template.trial.events({
    'click #fixation-cross.responsive'(e, template) {
        const session = template.session(),
            number = template.trial().number,
            stage = 1,
            delay = session.settings[number - 1][stage][0].delay,
            duration = session.settings[number - 1][stage][0].duration;
        console.log(delay, duration);

        template.timer.delay = setTimeout(() => {
            console.log('DELAY!');
            FlowRouter.go('/' + session._id + '/trial/' + number + '/stage/' + 2);
            template.timer.duration = setTimeout(() => {
                console.log('DURATION!');
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

        console.log(template.timer);
    },
    'click'(e, template) {
        /** Record trial events: */
        const center = template.center,
            event = collectEvent(e),
            session = template.session(),
            stage = parseInt(template.getStage()) - 1,
            trial = template.trial();
        let number = trial.number;

        /** Update Trial record with data of response to stimuli: */
        Meteor.call('updateTrial', number, event, session._id, stage);

        /** Handle events during stimuli presentation: */
        if (stage !== 0) {
            if (correctEvent(center, e, trial.stages[stage].visuals[0])) {
                template.audio.beep.play();
                console.log(template.timer);
                _.each(template.timer, (value) => clearTimeout(value));

                /** Proceed to next trial or exit: */
                if (number < session.settings.length) {
                    // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
                    Meteor.call('addTrial', ++number, session._id);
                    FlowRouter.go('/' + session._id + '/trial/' + number + '/stage/' + 1);
                } else {
                    FlowRouter.go('/');
                }
            } else {
                Meteor.call('mqttSend', session.device, 'led1', {command: 'turnOn'});
                Meteor.call('mqttSend', session.device, 'led2', {command: 'turnOn'});
                console.log(trial.stages[stage].visuals[0]);
                setTimeout(() => {
                        Meteor.call('mqttSend', session.device, 'led1', {command: 'turnOff'});
                        Meteor.call('mqttSend', session.device, 'led2', {command: 'turnOff'});
                    },
                    trial.stages[stage].visuals[0].light);
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
    this.getSession = () => FlowRouter.getParam('session');
    this.getStage = () => FlowRouter.getParam('stage');
    this.getTrial = () => parseInt(FlowRouter.getParam('trial'));
    this.timer = {
        delay: '',
        duration: '',
        iti: ''
    };

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
});

Template.cross.onRendered(function () {
    const number = this.parent().getTrial(),
        session = this.parent().session();
    console.log(number, session);

    if (number && session) {
        const stage = 1,
            iti = session.settings[number - 1][stage][0].iti;
        console.log(iti);

        this.parent().timer.iti = setTimeout(() => {
            console.log('ITI!');
            if (number < session.settings.length) {
                // TODO: Rethink Add Trial?  Move to fixation cross?  Trial is duplicating previous
                Meteor.call('addTrial', (number + 1), session._id);
                FlowRouter.go('/' + session._id + '/trial/' + (number + 1) + '/stage/' + 1);
            } else {
                FlowRouter.go('/');
            }
        }, iti);
    }
});
