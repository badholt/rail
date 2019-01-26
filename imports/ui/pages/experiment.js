import './experiment.html';

import '/imports/ui/pages/data';
import '/imports/ui/pages/run';
import '/imports/ui/pages/settings';

import {Experiments, Templates} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';
import {Meteor} from "meteor/meteor";

Template.experiment.helpers({
    experiment() {
        return Experiments.find();
    },
    path(action) {
        return Template.currentData().link + action;
    },
    template(templates, index) {
        /** For now we return the first(!) template in the list: */
        return Templates.findOne({_id: templates[index]});
    }
});

Template.experiment.onCreated(function () {
    this.getId = (experiment) => {
        if (experiment && experiment._id) return experiment._id;
    };
    this.getLink = () => FlowRouter.getParam('link');
    this.getExperiment = () => Experiments.findOne({link: '/experiments/' + this.getLink()});

    this.autorun(() => {
        const id = this.getId(this.getExperiment());
        this.subscribe('sessions.experiment', id);
        this.subscribe('templates.experiment', id, Meteor.userId());
        this.subscribe('trials.experiment', id);
    });
});
