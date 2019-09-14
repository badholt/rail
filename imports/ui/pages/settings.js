import './settings.html';

import '/imports/ui/components/dropdown/authorized';
import '/imports/ui/components/dropdown/template';

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

Template.settingsForm.events({
    'submit .form'(event, template) {
        event.preventDefault();
        const target = event.target || event.srcElement,
            values = $('#' + target.getAttribute('id')).form('get values');

        Meteor.call('updateExperiment', this, values);
    }
});


Template.settingsForm.onCreated(function () {
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});
    });
});

Template.settingsForm.onRendered(function () {
    $('.ui.form').form({
        fields: {
            users: 'empty'
        }
    });
});
