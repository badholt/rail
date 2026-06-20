/**
 * imports/ui/pages/devices.js
 *
 * Purpose:
 *  - Displays device status, sessions, & configuration controls
 *  - Handles session lifecycle actions (abort, queue inspection)
 *  - Issues device control commands (MQTT + Meteor methods)
 *  - Manages device calibration workflows (audio/screen/water)
 *
 * Notes:
 *  - Includes UI controls for device hardware (lights, IR, reward)
 *  - Reacts to session & subject publications
 * */

import './devices.html';
import './calibrate';

import { generateId } from 'human-ids';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import moment from 'moment/moment';
import _ from 'underscore';
import { Sessions, Subjects } from '/imports/api/collections';
import { mqttSend } from '/imports/services/mqtt';


const getCommand = (action, payload, device) => ({
        action,
        meta: {
            commandId: `cmd_${ generateId({ separator: '_' }) }`,
            device,
            issuedAt: performance.now(),
            source: 'hub'
        },
        payload,
        version: 1
    });


Template.deviceActivity.events({
    'click .abort'(_event, template) {
        const user = template.parent().data,
            cmd = {
                type: 'abort',
                issuedAt: performance.now(),
                issuedBy: Meteor.userId()
            };

        Meteor.callAsync('abortSession', [ cmd ], user);
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
        if (!session?.settings?.session) return;

		const t = moment(session.date),
            finish = t.add(session.settings.session.duration, 'ms').fromNow(true);

		return `${ finish } remaining`;
	},
    session(id) {
        if (id) return Sessions.findOne(id);
    }
});

Template.deviceActivity.onCreated(function () {
    this.autorun(() => {
        const id = Template.currentData();

        if (!id) return;

        this.subscribe('sessions.single', id);

        const session = Sessions.findOne(id);

        if (session?.subjects?.length) {
            this.subscribe('subjects.session', session.subjects);
        }
    });
});

Template.deviceCard.events({
    'click a[id^=calibrate-audio]'(_event, template) {
        template.calibrating.set({ profile: template.data.profile, window: 'audioCalibrationModal' });
        return template.data;
    },
    'click a[id^=calibrate-screen]'(_event, template) {
        template.calibrating.set({ profile: template.data.profile, window: 'screenCalibrationModal' });
        return template.data;
    },
    'click a[id^=calibrate-water]'(_event, template) {
        template.calibrating.set({ profile: template.data.profile, window: 'waterCalibrationModal' });
        return template.data;
    },
    'click .editable'(event, template) {
        const key = event.currentTarget.title,
            fields = {
                address: [ 'notEmpty' ],
                name: [ 'notEmpty', 'minLength[4]']
            };

        template.edit.set(key);

        if (_.has(fields, key)) $('.ui.form').form({
            fields: _.pick(fields, key),
            inline: true,
            on: 'blur',
            onValid() {
                const value = $(this[ 0 ]).val();

                Meteor.call('updateUser', template.data._id, `profile.${ [ key ] }`, 'set', value);
                template.edit.set('');
            }
        });
    },
    'click #toggle-lights'(_event, template) {
		let lights = template.lights.get();
        const msg = [
                { command: 'on', pins: [ 3, 4 ] },
                { command: 'off', pins: [ 3, 4 ] }
            ],
            cmd = getCommand('toggle_lights', msg[ lights ], template.data._id);

        mqttSend(`hub/${ template.data._id }/command`, cmd);
        template.lights.set((lights < msg.length - 1) ? ++lights : 0);
    },
    'click #toggle-ir'(_event, template) {
        const ir = template.ir.get(),
            cmd = getCommand('toggle_ir', { detect: ir ? 'off' : 'on' }, template.data._id);

        mqttSend(`hub/${ template.data._id }/command`, cmd);
        template.ir.set(!ir);
    },
    'click #toggle-reward'(_event, template) {
        const reward = template.reward.get(),
            cmd = getCommand('toggle_reward', { command: reward ? 'off' : 'on' }, template.data._id);

        mqttSend(`hub/${ template.data._id }/command`, cmd);
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
    hasSession({ pointer, queue }) {
        const cmd = queue[ pointer ];
        if (cmd?.type === 'start') return cmd.session;
    },
	ir() {
		return Template.instance().ir.get();
	},
	lights() {
		return Template.instance().lights.get();
	},
    pi(board, _profile) {
        return board;
    },
	reward() {
		return Template.instance().reward.get();
	}
});

Template.deviceCard.onCreated(function () {
    this.calibrating = new ReactiveVar({ profile: this.data.profile, window: '' });
    this.cipher = {}; // Stores template information to avoid reloading for each render
    this.edit = new ReactiveVar('');
	this.ir = new ReactiveVar(false);
    this.lights = new ReactiveVar(0);
    this.reward = new ReactiveVar(false);
});

Template.deviceCardMessage.onRendered(() => {
    const device = Template.instance().parent();

    $('.message .close').on('click', function () {
        $(this).closest('.message').transition('fade');
        Meteor.call('updateUser', device.data._id, 'status.message', 'unset', '');
    });
});

Template.devicePanel.helpers({
    devices() {
        return Meteor.users.find({ 'profile.device': { $ne: false } }, { sort: { 'profile.name': 1 } });
    }
});

Template.devicePanel.onCreated(function () {
    this.subscribe('users', { 'profile.device': { $ne: false } });
});

Template.deviceQueue.events({
    'click .delete'() {
        if (this.trials) {
            Meteor.call('removeTrials', this.trials, (error) => {
                if (error || !this._id) return;
                Meteor.call('removeSession', this._id);
            });
        } else if (this._id) {
            Meteor.call('removeSession', this._id);
        }
    },
    'click .queue .header'(_event, template) {
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
        return Sessions.find({ $and: [ { device: id }, { 'trials.0': { $exists: false } } ] });
    }
});

Template.deviceQueue.onCreated(function () {
    const device = Template.currentData(),
        date = new Date(Date.now() - 1000 * 60 * 60 * 12);

    this.subscribe('sessions.today', date, device._id);
    this.open = new ReactiveVar(false);
});

Template.editField.helpers({
    edit() {
        return Template.instance().parent().edit.get();
    }
});
