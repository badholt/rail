import './create.html';

import '/imports/ui/components/dropdown/template';

import {Experiments} from '/imports/api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

Template.createExperiment.events({
    'submit #experiment-form'(event) {
        event.preventDefault();
        const fields = $('#experiment-form').form('get values');

        Meteor.call('addExperiment', fields, (error, result) => {
            if (!error) {
                const experiment = Experiments.findOne(result);

                experiment.users.forEach((id) => {
                    Meteor.users.update(id, {
                        $push: {'profile.experiments': result}
                    });
                });

                FlowRouter.go(experiment.link + '/run');
            }
        });
    }
});

Template.createExperiment.onCreated(function () {
    this.autorun(() => {
        this.subscribe('experiments.user', Meteor.userId);
    });
});
