/**
 * ui/pages/create.js
 *
 * Description:
 *  Handles creation of new experiments
 * * * * * * * */
import './create.html';

import '/imports/ui/components/dropdown/template';

import {Experiments} from '/imports/api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from "meteor/reactive-var";

Template.createExperiment.events({
    /** Submits form with new experiment specifications */
    'submit #experiment-form'(event, template) {
        event.preventDefault();
        const fields = $('#experiment-form').form('get values');

        /** Template IDs are encoded & decoded locally, in order to avoid exposing the database */
        fields.template = template.cipher[fields.template]; //TO-DO: avoid variable reassignment

        Meteor.call('addExperiment', fields, (error, result) => {
            if (!error) {
                const experiment = Experiments.findOne(result);

                /** The new experiment id (result) is added to the access permissions for each authorized user */
                experiment.users.forEach((id) => {
                    Meteor.users.update(id, {
                        $push: {'profile.experiments': result}
                    });
                });

                /** After form submission, browser immediately redirects to the experiment page */
                FlowRouter.go(experiment.link + '/run');
            }
        });
    }
});

Template.createExperiment.onCreated(function () {
    /** Subscribes to all experiments accessible to user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => {
        this.subscribe('experiments.user', Meteor.userId());
    });

    /** Create empty "cipher" to mask database ids */
    this.cipher = {}; // For dropdown decryption
    this.templateId = new ReactiveVar('');
});
