import './home.html';
import '../components/accordion';
import '../components/data';

import {Experiments} from "../../api/collections";
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

Template.experiment.events({
    'click button'() {
        const devices = $('#device-form .ui.dropdown').dropdown('get value'),
            stages = Session.get('stages'),
            trial = Session.get('trial');

        // TODO: Form validation
        if (devices) Meteor.call('addSession', devices, this._id, function (error, session) {
            if (!error) Meteor.call('addTrial', this._id, trial, session, stages[1]);
        });
    }
});

Template.experiment.helpers({
    info() {
        return Template.instance().experiment();
    }
});

Template.experiment.onCreated(function () {
    this.getLink = () => FlowRouter.getParam('link');

    this.autorun(() => {
        this.getExperiment = function (experiment) {
            if (experiment && experiment._id) return experiment._id;
        };
        this.experiment = function () {
            return Experiments.findOne({link: '/experiments/' + this.getLink()});
        };

        this.subscribe('sessions.experiment', this.getExperiment(this.experiment()));
        this.subscribe('users.online');
        this.subscribe('trials.experiment', this.getExperiment(this.experiment()));
    });
});
