import './create.html';

import {Experiments} from '/imports/api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

Template.createExperiment.events({
    'submit #experiment-form'(event) {
        event.preventDefault();
        const fields = $('#experiment-form').form('get values');
        Meteor.call('addExperiment', fields, function (error, result) {
            if (!error) {
                FlowRouter.go(Experiments.findOne(result).link + '/run');
            }
        });
    }
});
