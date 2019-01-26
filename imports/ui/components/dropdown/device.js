import './device.html';

import '/imports/ui/components/profile';
import '/imports/ui/components/dropdown/template';

import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.deviceDropdown.helpers({
    device() {
        return Meteor.users.find({'profile.device': {$ne: false}});
    },
    encrypt(id) {
        const encrypted = _.uniqueId('user_');

        Template.instance().parent().cipher[encrypted] = id;
        return encrypted;
    },
    online(status) {
        return (status.online) ? 'green' : 'red';
    }
});

Template.deviceDropdown.onCreated(function () {
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});
    });
});

Template.deviceDropdown.onRendered(function () {
    $('#devices').dropdown();
});
