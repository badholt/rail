import './run.html';

import '/imports/ui/components/blacklist';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';
import '/imports/ui/components/dropdown/device';
import '/imports/ui/components/dropdown/element';
import '/imports/ui/components/dropdown/input';
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
import {Templates} from "../../api/collections";

const hasTemplate = (id, data) => {
    const templates = Templates.find({$or: [{users: 'any'}, {users: {$elemMatch: {$eq: id}}}]}).fetch();
    console.log(id, data, templates);
    return _.some(templates, (template) => {
        const a = _.pick(template, 'inputs', 'session', 'stages'),
            b = _.pick(data, 'inputs', 'session', 'stages'),
            inputs = _.isEqual(a.inputs, b.inputs),
            session = _.isEqual(a.session, b.session),
            stages = _.isEqual(
                _.map(a.stages, (stage) => _.map(stage, (element) => _.omit(element, 'index'))),
                _.map(a.stages, (stage) => _.map(stage, (element) => _.omit(element, 'index'))));
        console.log(a, b, inputs, session, stages);
        return inputs && session && stages;
    });
};

Template.sessionSetup.helpers({
    inputs() {
        return Template.instance().inputs.get();
    },
    page() {
        return Template.instance().page.get();
    },
    session() {
        return Template.instance().session.get();
    },
    stages() {
        return Template.instance().stages.get();
    },
    success() {
        return Template.instance().success.get();
    },
    template(id) {
        const template = Templates.findOne(id);
        console.log(id, template);
        if (template) {
            Template.instance().inputs.set(template.inputs);
            Template.instance().session.set(template.session);
            Template.instance().stages.set(template.stages);
            return template;
        }
    },
    templateId() {
        return Template.instance().templateId.get();
    }
});

Template.sessionSetup.onCreated(function () {
    this.cipher = {}; // For dropdown decryption
    this.inputs = new ReactiveVar('');
    this.page = new ReactiveVar(0);
    this.session = new ReactiveVar('');
    this.stages = new ReactiveVar('');
    this.submitForm = (inputs, session, stages) => {
        const devices = $('#devices').dropdown('get values'),
            experiment = this.parent().getExperiment()._id;
        console.log(experiment, inputs, session, stages, this.parent());

        if (devices) _.each(devices, (id) => {
            Meteor.call('generateTrials', inputs, session, stages, (error, trials) => {
                console.log(error, trials);
                if (!error) Meteor.call('addSession', this.cipher[id], experiment,
                    inputs, session, trials, (error, session) => {
                        console.log(error, session);
                        if (!error) Meteor.call('addTrial', session, 1, () => {
                            /** A submission success message appears for 5 seconds: */
                            // this.success.set(true);
                            // $('#success').transition('fade');
                            // Meteor.setTimeout(() => this.success.set(false), 5000);
                        });
                    });
            });
        });
    };
    this.success = new ReactiveVar(false);
    this.templateId = new ReactiveVar(this.data.templates[0]);
});

Template.sessionSuccess.onRendered(function () {
    $('.message .close')
        .on('click', function () {
            $(this).closest('.message').transition('fade');
        });
});

Template.sessionTemplate.events({
    'click #add-stage'() {
        const template = Template.instance().parent(),
            stages = template.stages.get();

        stages.push([]);
        template.stages.set(stages);
    },
    'click #save'(event, template) {
        const exists = hasTemplate(Meteor.userId(), _.omit(template.data, '_id'));
        console.log(exists);
        if (!exists) {
            Meteor.call('addTemplate', template.data);
        } else {
            console.log('Already saved!');
        }
    },
    'click button'() {
        const template = Template.instance().parent();
        console.log(template, Template.currentData());
        template.submitForm(template.inputs.get(), template.session.get(), template.stages.get());
    },
    'submit .form'(event) {
        event.preventDefault();

        const template = Template.instance().parent();
        template.submitForm(template.inputs.get(), template.session.get(), template.stages.get());
    }
});

Template.sessionTemplate.helpers({
    hasTemplate() {
        return hasTemplate(Meteor.userId(), Template.currentData());
    },
    index(index) {
        const page = Template.instance().data.page,
            active = _.isEqual(index, page);

        return {index: ++index, active: active};
    },
    input(page, inputs) {
        return inputs[page];
    },
    // page() {
    //     return Template.instance().parent().page.get();
    // },
    section(index) {
        return _.extend(this, {index: index});
    },
    stage(page, stages) {
        if (stages) return stages[page];
    }
});

Template.sessionTemplate.onRendered(function () {
    const parent = Template.instance().parent();

    parent.inputs.set(this.data.inputs);
    parent.page.set(0);
    parent.session.set(this.data.session);
    parent.stages.set(this.data.stages);

    $('#session-accordion').accordion({exclusive: false});
});

Template.stageItem.events({
    'click .stage'(event, template) {
        console.log(event, template, template.parent(), template.parent(2));
        Template.instance().parent(2).page.set(template.data.index - 1);
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
