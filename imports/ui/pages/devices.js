import './devices.html';

import {Meteor} from 'meteor/meteor';
import {Template} from "meteor/templating";

Template.deviceCard.events({
    'click #toggle-lights'(event, template) {
        const message = (template.lights)
            ? {command: "off", numbers: "LED_IR"}
            : {command: "on", numbers: "LED_IR"};

        console.log(event, template);
        Meteor.call('mqttSend', template.data._id, 'light', message);

        template.lights = !template.lights;
    }
});

Template.deviceCard.onCreated(function () {
    this.lights = true;
});

Template.devicePanel.helpers({
    devices() {
        return Meteor.users.find({'profile.device': {$ne: false}});
    }
});

Template.devicePanel.onCreated(function () {
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {'profile.device': {$ne: false}});
    });
});
