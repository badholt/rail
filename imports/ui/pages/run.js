import './run.html';

import '/imports/ui/components/blacklist';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';
import '/imports/ui/components/dropdown/device';
import '/imports/ui/components/dropdown/element';
import '/imports/ui/components/forms/audio';
import '/imports/ui/components/forms/cross';
import '/imports/ui/components/forms/light';
import '/imports/ui/components/forms/reward';
import '/imports/ui/components/forms/stimuli';
import '/imports/ui/components/forms/session';

import _ from 'underscore';

import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

Template.sessionSetup.events({
    'click #add-stage'() {
        const template = Template.instance(),
            stages = template.stages.get();

        stages.push([]);
        template.stages.set(stages);
    },
    'click button'() {
        const template = Template.instance();
        template.submitForm(template);
    },
    'submit .form'(event) {
        event.preventDefault();

        const template = Template.instance();
        template.submitForm(template);
    }
});

Template.sessionSetup.helpers({
    page() {
        return Template.instance().page.get();
    },
    section(index) {
        return _.extend(this, {index: index});
    },
    session() {
        return Template.instance().session.get();
    },
    stage(page, stages) {
        return stages[page];
    },
    stages() {
        return Template.instance().stages.get();
    },
    success() {
        return Template.instance().success.get();
    }
});

Template.sessionSetup.onCreated(function () {
    this.cipher = {}; // For dropdown decryption
    this.page = new ReactiveVar(0);
    this.session = new ReactiveVar(this.data.session);
    this.stages = new ReactiveVar(this.data.stages);
    this.submitForm = (form) => {
        const devices = $('#devices').dropdown('get values'),
            experiment = form.parent().getExperiment()._id;
        console.log(experiment, form.parent());

        if (devices) _.each(devices, (id) => {
            Meteor.call('generateTrials', form.data, (error, trials) => {
                console.log(error, trials);
                if (!error) Meteor.call('addSession', form.cipher[id], experiment, trials, (error, session) => {
                    if (!error) Meteor.call('addTrial', session, 1, () => {
                        /** A submission success message appears for 5 seconds: */
                        this.success.set(true);
                        $('#success').transition('fade');
                        Meteor.setTimeout(() => this.success.set(false), 5000);
                    });
                });
            });
        });
    };
    this.success = new ReactiveVar(false);
});

Template.sessionSetup.onRendered(function () {
    $('#session-accordion').accordion({exclusive: false});
});

Template.sessionSuccess.onRendered(function () {
    $('.message .close')
        .on('click', function () {
            $(this).closest('.message').transition('fade');
        });
});

Template.stageItem.events({
    'click .stage'(event, template) {
        Template.instance().parent().page.set(template.data.index);
    }
});

Template.stageItem.helpers({
    stage(index) {
        return index + 1;
    }
});

// TODO: Allow for multiple crosses??
Template.stagePage.events({
    'click #cross-section'(event, template) {
        const opened = template.opened.get();
        if (!opened) template.opened.set(true);
    }
});

Template.stagePage.onCreated(function () {
    this.opened = new ReactiveVar(false);
});
