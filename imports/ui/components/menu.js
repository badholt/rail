import './menu.html';
import './profile.html';
import './profile';
import '/imports/api/collections';

import {Experiments, Sessions} from '../../api/collections';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

Template.menu.events({
    'click .menu a.item'(event, template) {
        const item = $('.tabular.menu .active.item').get(0);
        if (item) {
            const action = item.getAttribute('id'),
                link = '/experiments/' + FlowRouter.getParam('link'),
                tabs = template.tabs.get(),
                experiment = Experiments.findOne({link: link});

            if (experiment) {
                tabs[experiment._id] = '/' + action;
                template.tabs.set(tabs);
            }
        }
    }
});

Template.menu.helpers({
    experiment() {
        return Template.instance().experiments();
    },
    session() {
        return Sessions.find({trials: {$size: 1}});
    },
    tabs(id) {
        return Template.instance().tabs.get()[id.toString()] || '/run';
    }
});

Template.menu.onCreated(function () {
    const user = Meteor.user();
    if (user.profile.device) {
        this.autorun(() => {
            this.subscribe('sessions.device', 'mqtt://' + user.profile.address);
        });
    } else {
        this.tabs = new ReactiveVar({});

        this.autorun(() => {
            this.experiments = () => Experiments.find({});
        });
        this.autorun(() => {
            this.subscribe('experiments.user', user._id);
        });
    }
});

Template.sessionWindow.onCreated(function () {
    const stage = 1,
        trial = 1;

    FlowRouter.go('/' + this.data._id + '/trial/' + trial + '/stage/' + stage);
});
