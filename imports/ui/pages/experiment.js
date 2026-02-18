import './experiment.html';
import '/imports/ui/pages/data';
import '/imports/ui/pages/run';
import '/imports/ui/pages/settings';

import { Experiments } from '../../api/collections';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";

Template.experiment.helpers({
    expanded(link) {
        return `/experiments/${ link.replace('/experiments/', '') }/`;
    },
    experiment() {
        return Template.instance().experiment.get();
    }
});

Template.experiment.onCreated(function () {
    this.getLink = () => FlowRouter.getParam('link').replace('/experiments/', ''); // For backwards compatibility
    this.getExperiment = () => Experiments.findOne({ link: { $regex: `${ this.getLink() }` } });
    this.experiment = new ReactiveVar({});

    this.autorun(() => {
        const experiment = this.getExperiment();

        if (experiment) {
            this.subscribe('templates.experiment', experiment, Meteor.userId());
            this.experiment.set(experiment);
        }
    });
});
