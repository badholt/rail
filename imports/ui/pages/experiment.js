import './experiment.html';

import '/imports/ui/pages/data';
import '/imports/ui/pages/log';
import '/imports/ui/pages/run';
import '/imports/ui/pages/settings';

import {Experiments} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';
import {Meteor} from "meteor/meteor";

Template.experiment.helpers({
    experiment() {
        return Experiments.find();
    },
    path(action) {
        return Template.currentData().link + action;
    }
});

Template.experiment.onCreated(function () {
    this.getLink = () => FlowRouter.getParam('link');
    this.getExperiment = () => Experiments.findOne({link: '/experiments/' + this.getLink()});

    this.autorun(() => {
        const experiment = this.getExperiment();
        if (experiment) this.subscribe('templates.experiment', experiment, Meteor.userId());
    });
});
