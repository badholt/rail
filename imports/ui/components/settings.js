import './settings.html';

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

let getUsers = (users) => {console.log(users);
    return Meteor.users.find({_id: {$in: users}}).map((value) => {
        console.log(value);
        return ({
            name: value.profile.name,
            value: value.profile.username,
            selected: true
        });
    });
};

Template.settingsForm.events({
    'submit .form'(event) {
        event.preventDefault();
        const target = event.target || event.srcElement,
            values = $('#' + target.getAttribute('id')).form('get values');

        Meteor.call('updateExperiment', this, values);
        values.users.forEach((username) => {
            Meteor.call('updateUser', username, this._id);
        });
    }
});

Template.settingsForm.helpers({
    selected() {
        console.log(this, Template.instance().values.get());
        $('.ui.dropdown').dropdown({values: Template.instance().values.get()});
    },
    user() {
        return Meteor.users.find({'profile.device': false});
    }
});

Template.settingsForm.onCreated(function () {
    this.autorun(() => {
        this.subscribe('users', {'profile.device': false});
    });

    this.values = new ReactiveVar(getUsers(Template.currentData().users));
});

Template.settingsForm.onRendered(function () {
    this.autorun(() => {
        $('.ui.dropdown').dropdown({values: Template.instance().values.get()});
    });

    $('.ui.form').form({
        fields: {
            users: 'empty'
        }
    });
});
