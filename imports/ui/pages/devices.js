import './devices.html';

import _ from 'underscore';

import {Meteor} from 'meteor/meteor';
import {Template} from "meteor/templating";

Template.deviceCard.events({
    'click .abort'(event, template) {
        console.log(template);
        Meteor.call('updateUser', template.data._id, 'status.active.session', 'set', '');
    },
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
        const messages = [
            {command: "on", pins: [2]},
            {command: "on", pins: [3]},
            {command: "on", pins: [4]},
            {command: "off", pins: [2, 3, 4]},
            {command: "on", pins: [2, 3, 4]},
            {command: "off", pins: [2, 3, 4]},
        ];

        Meteor.call('mqttSend', template.data._id, 'lights',
            _.extend(messages[template.lights], template.getContext()));
        template.lights = (template.lights < messages.length) ? ++template.lights : 0;
    },
    'click #toggle-ir'(event, template) {
        const messages = (template.ir)
            ? {command: "detect", detect: "off"}
            : {command: "detect", detect: "on"};

        Meteor.call('mqttSend', template.data._id, 'reward', _.extend(messages, template.getContext()));
        template.ir = !template.ir;
    },
    'click #toggle-reward'(event, template) {
        const messages = (template.reward)
            ? {command: "off"}
            : {command: "on"};

        Meteor.call('mqttSend', template.data._id, 'reward', _.extend(messages, template.getContext()));
        template.reward = !template.reward;
    }
});

Template.deviceCard.onCreated(function () {
    this.getContext = () => ({
        context: {
            device: this.data._id,
            time: performance.now()
        }
    });
    this.edit = new ReactiveVar('');
    this.lights = 0;
    this.reward = false;

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

Template.deviceCardMessage.onRendered(function () {
    const device = Template.instance().parent();

    $('.message .close').on('click', function () {
        $(this).closest('.message').transition('fade');
        Meteor.call('updateUser', device.data._id, 'status.message', 'unset', '');
    });
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
