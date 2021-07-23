import './run.html';

import '/imports/ui/components/blacklist';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';
import '/imports/ui/components/dropdown/device';
import '/imports/ui/components/dropdown/element';
import '/imports/ui/components/dropdown/input';
import '/imports/ui/components/dropdown/subjects';
import '/imports/ui/components/forms/audio';
import '/imports/ui/components/forms/cross';
import '/imports/ui/components/forms/light';
import '/imports/ui/components/forms/reward';
import '/imports/ui/components/forms/stimuli';
import '/imports/ui/components/forms/session';
import '/imports/ui/components/forms/template';

import _ from 'underscore';
import update from "immutability-helper";

import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';
import {Templates} from "../../api/collections";

const hasTemplate = (id, data) => {
    const templates = Templates.find({$or: [{users: 'any'}, {users: {$elemMatch: {$eq: id}}}]}).fetch();

    return _.some(templates, (template) => {
        const a = _.pick(template, 'inputs', 'session', 'stages'),
            b = _.pick(data, 'inputs', 'session', 'stages'),
            inputs = _.isEqual(a.inputs, b.inputs),
            session = _.isEqual(a.session, b.session),
            stages = _.isEqual(
                _.map(a.stages, (stage) => _.map(stage, (element) => _.omit(element, 'index'))),
                _.map(a.stages, (stage) => _.map(stage, (element) => _.omit(element, 'index'))));

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
        const form = $('#device-form').form('get values'),
            devices = form.devices.split(','),
            experiment = this.parent().getExperiment()._id;
        console.log(stages);

        if (devices) _.each(devices, (id) => {
            const device = this.cipher[id],
                subjects = _.map(form[id], (subject) => this.cipher[subject]);
            console.log(id, this.cipher, form, subjects);

            Meteor.call('generateTrials', inputs, session, stages, (error, trials) => {
                console.log(error, trials);
                if (!error) Meteor.call('addSession', device, experiment,
                    inputs, session, subjects, trials, (error, session) => {
                        console.log(error, session, performance.timeOrigin, performance.now());
                        if (!error) Meteor.call('addTrial', session, 0, 1, Date.now(), () => {
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
    this.templateId = new ReactiveVar(_.last(this.data.templates));
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

        if (!exists) {
            /** Open modal: */
            $('#template-modal').modal('show');
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
    device() {
        const template = Template.instance(),
            devices = template.devices.get(),
            cipher = template.parent().cipher,
            ids = _.map(devices, (encrypted) => cipher[encrypted.value]);

        return Meteor.users.find({_id: {$in: ids}});
    },
    hasTemplate() {
        return hasTemplate(Meteor.userId(), Template.currentData());
    },
    index(index) {
        const page = Template.instance().data.page,
            active = _.isEqual(index, page);

        return {index: ++index, active: active};
    },
    stage(page, stages) {
        if (stages) return stages[page];
    }
});

Template.sessionTemplate.onCreated(function () {
    this.devices = new ReactiveVar(0);
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
        Template.instance().parent(2).page.set(template.data.index - 1);
    }
});

Template.stagePage.helpers({
    forms(type) {
        const forms = {
            audio: {data: this, form: 'audioForm', icon: 'music', title: 'Audio'},
            cross: {data: this, form: 'crossForm', icon: 'plus', title: 'Fixation Cross'},
            lights: {data: this, form: 'lightForm', icon: 'lightbulb', title: 'Lights'},
            reward: {data: this['element'], form: 'rewardForm', icon: 'star', title: 'Reward'},
            stimuli: {data: this, form: 'stimuliForm', icon: 'bars', title: 'Stimuli'},
        };
        return forms[type];
    }
});

// TODO: Allow for multiple crosses??
Template.stagePage.events({
    'click .delete.icon'(event, template) {
        const session = template.parent(2),
            stages = session.stages.get();

        session.stages.set(update(stages, {[template.data.page]: {$splice: [[template.data.i, 1]]}}));
    },
    'click [id^=cross]'(event, template) {
        const opened = template.opened.get();
        if (!opened) template.opened.set(true);
    }
});

Template.stagePage.onCreated(function () {
    this.opened = new ReactiveVar(false);
});
