import './accordion.html';

import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

const submitForm = (form) => {
    const devices = $('#device-form .ui.dropdown').dropdown('get value');
    if (devices) Meteor.call('generateSettings', form.trials.total, form.stimuli.number, (error, result) => {
        if (!error) Meteor.call('addSession', devices, form.data._id, form.trials.total, result, (error, session) => {
            if (!error) Meteor.call('addTrial', 1, session);
        });
    });
};

Template.accordion.events({
    'click button'() {
        submitForm(Template.instance());
    },
    'input input'(event) {
        const form = Template.instance(),
            target = event.target || event.srcElement,
            value = parseInt($('#' + target.form.id).form('get value', target.name));

        switch (target.name) {
            case 'number':
                Meteor.call('generateStages', value, (err, result) => {
                    if (!err) form.stages = result;
                    form.stimuli[target.name] = value;
                });
                break;
            case 'total':
                form.trials[target.name] = parseInt(value);
                break;
        }
    },
    'submit .form'(event) {
        event.preventDefault();
        submitForm(Template.instance());
    }
});

Template.accordion.helpers({
    stimuli() {
        return Template.instance().stimuli;
    },
    trials() {
        return Template.instance().trials;
    }
});

Template.accordion.onCreated(function () {
    let form = this;
    form.stimuli = {
        number: 2
    };
    form.trials = {
        total: 5
    };
    Meteor.call('generateStages', form.stimuli.number, (err, result) => {
        if (!err) return form.stages = result;
    });
});

Template.accordion.onRendered(function () {
    $('.ui.accordion').accordion({exclusive: false});
});

Template.deviceForm.helpers({
    device() {
        return Meteor.users.find({'profile.device': true});
    }
});

Template.deviceForm.onRendered(function () {
    $('select.dropdown').dropdown();
});
