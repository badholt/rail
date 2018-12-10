import './experiment.html';
import '../components/data';
import '../components/run';
import '../components/settings';

import {Experiments} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

Template.experiment.helpers({
    info() {
        return Template.instance().experiment();
    }
});

Template.experiment.onCreated(function () {
    this.getLink = () => FlowRouter.getParam('link');

    this.autorun(() => {
        this.experiment = () => Experiments.findOne({link: '/experiments/' + this.getLink()});
        this.getExperiment = (experiment) => {
            if (experiment && experiment._id) return experiment._id;
        };

        this.subscribe('sessions.experiment', this.getExperiment(this.experiment()));
        this.subscribe('trials.experiment', this.getExperiment(this.experiment()));
    });
});
