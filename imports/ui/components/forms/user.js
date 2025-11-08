import './user.html';

import { Meteor } from 'meteor/meteor';
import { Template } from "meteor/templating";

Template.userForm.events({
    'submit #user-form'(event, template) {
        event.preventDefault();
        const fields = $('#user-form').form('get values');
        Meteor.call('updateProfile', template.parent().data._id, fields);
    }
});
