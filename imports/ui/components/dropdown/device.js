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
        const cipher = Template.instance().parent(2).cipher,
            ids = _.invert(cipher),
            encrypted = (!ids[id]) ? _.uniqueId('device_') : ids[id];

        cipher[encrypted] = id;
        return encrypted;
    }
});

Template.deviceDropdown.onCreated(function () {
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});
    });
});

Template.deviceDropdown.onRendered(function () {
    const template = Template.instance().parent();

    $('#devices').dropdown({
        onChange(values) {
            const devices = _.map(values.split(','), (value) => {
                const selected = $(this).find('div[data-value="' + value + '"]');

                console.log(template);
                return ({
                    name: selected.html(),
                    value: value
                });
            });

            template.devices.set(devices);
        },
        sortSelect: true
    });

    template.devices.set([]);
});
