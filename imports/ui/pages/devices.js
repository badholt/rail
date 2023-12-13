import './devices.html';
import './calibrate';

import _ from 'underscore';
import moment from 'moment/moment';

import {renderCross} from '../components/cross';
import {Meteor} from 'meteor/meteor';
import {Sessions, Subjects} from '../../api/collections';
import {Template} from "meteor/templating";

Template.deviceActivity.events({
    'click .abort'(event, template) {
        Meteor.call('updateUser', template.parent().data._id, 'status.active.session', 'set', '');
    }
});

Template.deviceActivity.helpers({
    name(date, subjects) {
        let t = moment(date).format('ddd HH:mm');

        _.each(subjects, (id, i) => {
            const subject = Subjects.findOne(id);
            if (subject) {
                t += (i > 0) ? '& ' : ' - ';
                t += subject.identifier;
            }
        });

        return t;
    },
	remaining(session) {
		const t = moment(session.date),
		finish = t.add(session.settings.session.duration, 'ms').fromNow(true);

		return finish + ' remaining';
	},
    session(id) {
        if (id) return Sessions.findOne(id);
    }
});

Template.deviceActivity.onCreated(function () {
	this.autorun(() => {
		const id = Template.currentData(),
        session = Sessions.findOne(id);

        if (id) this.subscribe('sessions.single', id);
        if (session) this.subscribe('subjects.session', session.subjects);
    });
});

Template.deviceCard.events({
    'click a[id^=calibrate-screen]'(event, template) {
        template.calibrating.set('screenCalibrationModal');
        return template.data;
    },
    'click a[id^=calibrate-water]'(event, template) {
        template.calibrating.set('waterCalibrationModal');
        return template.data;
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
		let lights = template.lights.get();
        const messages = [
            {command: "on", pins: [3, 4]},
            {command: "off", pins: [3, 4]}
        ];

        Meteor.call('mqttSend', 'test_' + template.data._id, 'lights',
            _.extend(messages[lights], template.getContext()));
        template.lights.set((lights < messages.length - 1) ? ++lights : 0);
    },
    'click #toggle-ir'(event, template) {
        const ir = template.ir.get(),
		messages = (ir)
            ? {command: "detect", detect: "off"}
            : {command: "detect", detect: "on"};

        Meteor.call('mqttSend', 'test_' + template.data._id, 'sensor', _.extend(messages, template.getContext()));
        template.ir.set(!ir);
    },
    'click #toggle-reward'(event, template) {
        const reward = template.reward.get(),
		messages = (reward)
            ? {command: "off"}
            : {command: "on"};

        Meteor.call('mqttSend', 'test_' + template.data._id, 'reward', _.extend(messages, template.getContext()));
        template.reward.set(!reward);
    }
});

Template.deviceCard.helpers({
    calibrating() {
        return Template.instance().calibrating.get();
    },
    color(status) {
        if (status) return (status.online) ? (!status.idle) ? 'green' : 'yellow' : 'red';
    },
	ir() {
		return Template.instance().ir.get();
	},
	lights() {
		return Template.instance().lights.get();
	},
    pi(board, profile) {
        return board;
    },
	reward() {
		return Template.instance().reward.get();
	}
});

Template.deviceCard.onCreated(function () {
    this.calibrating = new ReactiveVar(false);
    this.getContext = () => ({
        context: {
			device: this.data._id,
            timeStamp: performance.now()
        }
    });
    this.edit = new ReactiveVar('');
	this.ir = new ReactiveVar(false);
    this.lights = new ReactiveVar(0);
    this.reward = new ReactiveVar(false);

//    Meteor.call('mqttConnect', this.data._id, (error) => {
//        if (!error) Meteor.call('mqttSend', this.data._id, 'board', {command: 'status'});
//    });
});

/*Template.deviceCard.onDestroyed(function () {console.log('destroyed');
    Meteor.call('mqttSend', 'test_' + this.data._id, 'client', {command: 'disconnect'});
});*/

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

Template.deviceQueue.events({
    'click .delete'(event, template) {
        console.log(this._id, this.trials);
        if (this.trials) {
            Meteor.call('removeTrials', this.trials, (error, result) => {
                if (!error && this._id) Meteor.call('removeSession', this._id);
            });
        } else if (this._id) {
            Meteor.call('removeSession', this._id);
        }
    },
    'click .queue .header'(event, template) {
        const open = template.open.get();
        template.open.set(!open);
    }
});

Template.deviceQueue.helpers({
    name(date, subjects) {
        let t = moment(date).format('ddd HH:mm');
        
        _.each(subjects, (id, i) => {
            const subject = Subjects.findOne(id);
            if (subject) {
                t += (i > 0) ? '& ' : ' - ';
                t += subject.identifier;
            }
        });

        return t;
    },
    open() {
        return Template.instance().open.get();
    },
    sessions(id) {
        return Sessions.find({$and: [{device: id}, {$or: [{trials: {$size: 1}}, {trials: []}]}]});
    }
});

Template.deviceQueue.onCreated(function () {
    const device = Template.currentData(),
        date = new Date(Date.now() - 1000 * 60 * 60 * 12);

    this.autorun(() => {
        this.subscribe('sessions.today', date, device._id);
    });
    this.open = new ReactiveVar(false);
});

Template.editField.helpers({
    edit() {
        return Template.instance().parent().edit.get();
    }
});

Template.piRow.events({
    'click'(e, template) {
        const device = Template.instance().parent(2);
        // Meteor.call('updateUser', device.data._id, 'profile.components', 'push', {
        //     device: 'IR Sensor',
        //     mode: 'IN',
        //     pin: template.data.physical
        // });
        $('#modal-device').modal('show');
    }
});

Template.piRow.helpers({
    property(pairs) {
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
