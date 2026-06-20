/**
 * imports/ui/components/menu.js
 *
 * Purpose:
 *  - Displays experiment navigation UI for experimenters
 *  - Coordinates session lifecycle actions for devices (not source of truth)
 *  - Manages tab navigation state per experiment
 *
 * Notes:
 *  - Attaches idle queue processor to `sessionWindow` template
 *  - Reacts to session state via Meteor publications
 * */

import './menu.html';
import './profile.html';
import '../pages/calibrate';
import '/imports/api/collections';
import '/imports/ui/components/profile';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Experiments, Sessions } from '../../api/collections';

Template.calibrationWindow.onCreated(() => { if (Template.currentData().cross) FlowRouter.go('/calibrate'); });

Template.menu.events({
    'click .ui.menu > a.item'(_event, template) {
        const item = $('.labeled.menu .active.item').get(0);

        if (!item) return;

        const action = item.getAttribute('id'),
            tabs = template.tabs.get(),
            experiment = Experiments.findOne({ link: { $regex: `${ FlowRouter.getParam('link') }` } });

        if (experiment) {
            tabs[ experiment._id ] = action;
            template.tabs.set(tabs);
        }
    }
});

Template.menu.helpers({
    expanded(link) {
        return `/experiments/${ link.replace('/experiments/', '') }/`;
    },
    experiment() {
        return Experiments.find({ _id: { $nin: Meteor.user().profile?.hidden ?? [] } });
    },
    session() {
        return Sessions.find({ 'trials.0': { $exists: false } });
    },
    tabs(id) {
        return Template.instance().tabs.get()[ id.toString() ] || 'run';
    }
});

Template.menu.onCreated(function () {
    const user = Meteor.user(),
        date = new Date(Date.now() - 1000 * 60 * 60 * 12);

    this.autorun(() => {
        if (user.profile.device) {
            this.subscribe('sessions.today', date, user._id);
            this.subscribe('users', { _id: user._id });
        } else {
            this.subscribe('experiments.user', user._id);
            this.tabs = new ReactiveVar({});
        }
    });
});

Template.sessionWindow.onCreated(function () {
    /** Abort if no device is given: */
    if (!this.data.device) return;

    /** Queue command to start session: */
    Meteor.call('updateUser', this.data.device, 'status.active.session.queue', 'push',
        { type: 'start', session: this.data._id, issuedAt: performance.now(), issuedBy: Meteor.userId() });

    /** Respond to any incoming commands: */
    this.lastCommand = new ReactiveVar(null);
    this.handleCommand = (cmd) => {
        switch (cmd.type) {
            case 'start':
                FlowRouter.go(`/session/${ this.data._id }`);
                this.lastCommand.set(cmd.issuedAt);
                break;

            default:
                return;
        }
    };

    /** Session Queue - Idle Processor: */
    this.autorun(() => {
        const user = Meteor.user(),
            session = user?.status?.active?.session;

        /** Only devices should maintain a session queue: */
        if (!user.profile.device || !session?.queue?.length || session.pointer > session.queue.length) return;

        const { pointer, queue } = session,
            cmd = queue[ pointer ?? 0 ];

        if (!cmd || this.lastCommand.get() === cmd.issuedAt) return;
        this.handleCommand(cmd);
    });
});
