import './settings.html';

import '/imports/ui/components/dropdown/authorized';
import '/imports/ui/components/dropdown/template';

import { clients as clients } from '/imports/api/server.methods';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Templates } from "../../api/collections";

Template.clientList.events({
    'click .button[id^=connect]'(e, template) {
		const id = e.target.value;

		Meteor.call('updateClient', id, 'connect');
        Meteor.call('getClients');
    },
    'click .button[id^=disconnect]'(e, template) {
		const id = e.target.value;

		Meteor.call('updateClient', id, 'end');
        Meteor.call('getClients');
    }
});

Template.clientList.helpers({
    clients(list) {
        return _.values(list);
    },
	users() {
		return Meteor.users.find({ 'profile.device': { $type: 'string' } });
	}
});

Template.clientList.onCreated(function () {
    this.autorun(() => this.subscribe('users', { 'profile.device': { $type: 'string' } }));
	Meteor.call('getClients');
});

Template.settingsForm.events({
    'submit .form'(e, template) {
        e.preventDefault();

        const target = e.target || e.srcElement,
            values = $('#' + target.getAttribute('id')).form('get values');

        Meteor.call('updateExperiment', this, values);
    }
});

Template.settingsForm.onRendered(function () {
    $('.ui.form').form({ fields: { users: 'notEmpty' } });
});

Template.templateItem.events({
    'click .delete.icon:not(.disabled)'(e, template) {
        Meteor.call('removeTemplate', template.data._id);
    },
    'click .star.icon'(e, template) {
        const experiment = template.parent(2);
        Meteor.call('setDefaultTemplate', experiment.data._id, template.data._id);
    }
});

Template.templateItem.helpers({
    current(id) {
        const experiment = Template.instance().parent();
        if (experiment && experiment.data.templates) return (_.last(experiment.data.templates) === id);
    },
    default(users) {
        return _.contains(users, 'any');
    }
});

Template.templateList.helpers({
    templates() {
        return Templates.find({}, { sort: { name: 1 } });
    }
});

Template.templateList.onCreated(function () {
    /** Subscribes to all experiments accessible with user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => this.subscribe('templates.user', Meteor.userId()));
});
