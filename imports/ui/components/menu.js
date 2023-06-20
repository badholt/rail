import './menu.html';
import './profile.html';
import '../pages/calibrate';

import '/imports/api/collections';
import '/imports/ui/components/profile';

import {Experiments, Sessions} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

Template.calibrationWindow.onCreated(function () {
    FlowRouter.go('/calibrate');
});

Template.menu.events({
    'click .ui.menu > a.item'(event, template) {
        const item = $('.tabular.menu .active.item').get(0);

        if (item) {
            const action = item.getAttribute('id'),
                link = '/experiments/' + FlowRouter.getParam('link'),
                tabs = template.tabs.get(),
                experiment = Experiments.findOne({link: link});
            console.log(tabs);

            if (experiment) {
                tabs[experiment._id] = '/' + action;
                template.tabs.set(tabs);
            }
        } else {
            console.log(template.tabs.get());
        }
    }
});

Template.menu.helpers({
    experiment() {
        return Experiments.find();
    },
    session() {
        return Sessions.find({trials: {$size: 1}});
    },
    tabs(id) {
        return Template.instance().tabs.get()[id.toString()] || '/run';
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
            // this.subscribe('users.user', 'session');
        } else {
            this.subscribe('experiments.user', user._id);
            this.tabs = new ReactiveVar({});
        }
    });
});

Template.sessionWindow.onCreated(function () {
    //TODO: Handle multiple Sessions in the queue (ready at once)
    Meteor.call('updateUser', this.data.device, 'status.active.session', 'set', this.data._id);
    FlowRouter.go('/session/' + this.data._id);
});
