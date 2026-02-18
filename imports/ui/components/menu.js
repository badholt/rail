import './menu.html';
import './profile.html';
import '../pages/calibrate';
import '/imports/api/collections';
import '/imports/ui/components/profile';

import { Experiments, Sessions } from '../../api/collections';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

Template.calibrationWindow.onCreated(() => { if (Template.currentData().cross) FlowRouter.go('/calibrate'); });

Template.menu.events({
    'click .ui.menu > a.item'(_event, template) {
        const item = $('.labeled.menu .active.item').get(0);

        if (item) {
            const action = item.getAttribute('id'),
                tabs = template.tabs.get(),
                experiment = Experiments.findOne({ link: { $regex: `${ FlowRouter.getParam('link') }` } });

            if (experiment) {
                tabs[ experiment._id ] = action;
                template.tabs.set(tabs);
            }
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
        return Sessions.find({ trials: { $size: 1 } });
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
            this.subscribe('users.user', 'calibration');
            Meteor.call('updateUser', user._id, 'status.active.session', 'set', '');
        } else {
            this.subscribe('experiments.user', user._id);
            this.tabs = new ReactiveVar({});
        }
    });
});

Template.sessionWindow.onCreated(function () {
    //TODO: Handle multiple Sessions in the queue (ready at once)
    Meteor.call('updateUser', this.data.device, 'status.active.session', 'set', this.data._id);
    FlowRouter.go(`/session/${ this.data._id }`);
});
