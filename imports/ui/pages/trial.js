import './trial.html';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import {Experiments, Sessions, Trials} from "../../api/collections";
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

const calculateCenter = function (height, width) {
        this.x = Math.floor(width / 2);
        this.y = Math.floor(height / 2);
        return this;
    },
    collectEvent = function (e) {
        JSON.stringify(_.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
            function (key, value) {
                if (value instanceof Node) {
                    return {
                        classes: value.classList,
                        id: value.id,
                        parent: {
                            classes: value.parentNode.classList,
                            id: value.parentNode.id
                        }
                    };
                } else if (value instanceof Window) {
                    return 'Window';
                } else {
                    return value;
                }
            }, ' ');
    },
    correctEvent = function (e, stage) {
        if (stage) {
            const answer = (Session.get('center x') < e.clientX) ? 90 : 0,
                visuals = stage.visuals[0];
            if (visuals) return (visuals.orientation.value === answer);
        }
    };

Template.trial.events({
    'click #fixation-cross.responsive'() {
        const session = Template.instance().getSession(),
            trial = Template.instance().getTrial();

        //Session.set('stage', 2);
        FlowRouter.go('/' + session + '/trial/' + trial + '/stage/' + 2);
    },
    'click'(e) {
        /** Record trial events: */
        const event = collectEvent(e),
            session = Template.instance().session(),
            stage = parseInt(Template.instance().getStage()) - 1,
            trial = Template.instance().trial(),
            total = Session.get('total');
        let number = Template.instance().getTrial();

        /** Update Trial record with data of response to stimuli: */
        Meteor.call('updateTrial', number, event, session._id, stage);

        /** Handle events during stimuli presentation: */
        if (stage === 1) {
            if (correctEvent(e, trial.stages[stage])) {
                //TODO: Reward port event
                Meteor.call('mqttSend', session.device, 'test', 'a trial event occurred');

                /** Proceed to next trial or exit: */
                if (number < total) {
                    //TODO: Rethink Add Trial?  Move to fixation cross?
                    Meteor.call('addTrial', trial.experiment, ++number, session._id, Session.get('stages')[1]);
                    FlowRouter.go('/' + session._id + '/trial/' + number + '/stage/' + 1);
                } else {
                    const experiment = Template.instance().experiment(trial),
                        link = (experiment) ? experiment.link + '/data' : '/';
                    FlowRouter.go(link);
                }
            } else {
                Meteor.call('mqttSend', session.device, 'led1', {command: 'toggle'});
            }
        }
    }
});

Template.trial.helpers({
    crossSettings(stage) {
        if (this.stages) {
            const settings = this.stages[stage].visuals[0].cross,
                cross = (stage === 0) ? 'responsive visible' : 'invisible',
                region = (stage === 0) ? 'responsive' : 'unresponsive';

            return _.extend(settings, {cross: cross, region: region});
        }
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
    this.getSession = () => FlowRouter.getParam('session');
    this.getStage = () => FlowRouter.getParam('stage');
    this.getTrial = () => parseInt(FlowRouter.getParam('trial'));

    this.autorun(() => {
        this.getExperiment = function (session) {
            if (session && session.experiment) return session.experiment;
        };
        this.experiment = function (trial) {
            if (trial && trial.experiment) return Experiments.findOne(trial.experiment);
        };
        this.session = function () {
            return Sessions.findOne(this.getSession())
        };
        this.stage = function () {
            return this.getStage();
        };
        this.trial = function () {
            return Trials.findOne({number: this.getTrial(), session: this.getSession()});
        };

        this.subscribe('sessions.single', this.getSession());
        this.subscribe('trials.single', this.getSession());
        this.subscribe('experiments.single', this.getExperiment(this.session()));
    });

    let center = calculateCenter($(document).height(), $(document).width());
    Session.set('center x', center.x);
    Session.set('center y', center.y);
});
