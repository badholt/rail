import './devices.html';

import _ from 'underscore';

import {Meteor} from 'meteor/meteor';
import {Template} from "meteor/templating";

Template.deviceCard.events({
    'click .editable'(event, template) {
        template.edit.set(event.currentTarget.title);

        $('.ui.form').form({
            fields: {
                address: ['empty'],
                name: ['empty', 'minLength[4]']
            },
            inline: true,
            on: 'blur',
            onSuccess(event, fields) {
                Meteor.call('updateUser', template.data._id, 'profile.name', 'set', fields.name);
                template.edit.set('');
            },
            onValid() {
                const value = $(this[0]).val();

                Meteor.call('updateUser', template.data._id, 'profile.name', 'set', value);
                template.edit.set('');
            }
        });
    },
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
    this.edit = new ReactiveVar('');
    this.lights = true;

    Meteor.call('mqttConnect', this.data._id, (error) => {
        if (!error) Meteor.call('mqttSend', this.data._id, 'board', {command: 'status'});
    });
});

Template.deviceCard.helpers({
    color(status) {
        if (status) return (status.online) ? (!status.idle) ? 'green' : 'yellow' : 'red';
    },
    pi(board, profile) {
        console.log(board, profile.device);
        return board;
    }
});

Template.deviceCard.onDestroyed(function () {
    Meteor.call('mqttSend', this.data._id, 'client', {command: 'disconnect'});
});

Template.deviceModal.onRendered(function () {
    $('#device-modal')
        .modal({context: '#main-panel'})
        .modal('attach events', '#modal-' + this.data.profile.username, 'show');
    $('.ui.dropdown').dropdown();
});

Template.devicePanel.helpers({
    devices() {
        return Meteor.users.find({'profile.device': {$ne: false}}, {sort: {'profile.name': 1}});
    }
});

Template.devicePanel.onCreated(function () {
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {'profile.device': {$ne: false}});
    });
});

Template.editField.helpers({
    edit() {
        return Template.instance().parent().edit.get();
    }
});

Template.piRow.events({
    'click'(e, template) {
        const device = Template.instance().parent(2);
        console.log(device, template.data);
        // Meteor.call('updateUser', device.data._id, 'profile.components', 'push', {
        //     device: 'IR Sensor',
        //     mode: 'IN',
        //     pin: template.data.physical
        // });
        // $('#modal-device').modal('show');
    }
});

Template.piRow.helpers({
    property(pairs) {
        console.log(pairs);
        return _.map(pairs, (pair) => ({key: pair[0], value: pair[1]}));
    }
});

Template.piModal.helpers({
    boards(pins) {
        return _.partition(pins, (pin) => (pin.physical % 2));
    },
    headings(index) {
        const headings = ['', 'BCM', 'Mode', 'Name', 'wPi'];
        return (index > 0) ? headings : headings.reverse();
    },
    pin(index, pins, components) {
        return _.map(pins, (pin) => {
            const component = _.find(components, (component) =>
                    _.contains(component['pins'], parseInt(pin.physical))),
                properties = _.pairs(_.omit(pin, 'physical', 'voltage'));

            return {
                board: index,
                component: component,
                mode: pin.mode,
                physical: pin.physical,
                pairs: (index > 0) ? properties : properties.reverse(),
                voltage: pin.voltage
            };
        });
    }
});

Template.piModal.onRendered(function () {
    $('#modal-' + this.data.profile.username)
        .modal({allowMultiple: true, context: '#main-panel'})
        .modal('attach events', '#pins-' + this.data.profile.username, 'show');
});
