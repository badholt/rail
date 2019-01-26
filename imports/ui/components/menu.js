import './menu.html';
import './profile.html';

import '/imports/api/collections';
import '/imports/ui/components/profile';

import {Experiments, Sessions} from '../../api/collections';
import {FlowRouter} from 'meteor/kadira:flow-router';
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
            console.log(tabs);

            if (experiment) {
                tabs[experiment._id] = '/' + action;
                template.tabs.set(tabs);
            }
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
    this.autorun(() => {
        const user = Meteor.user();

        if (user.profile.device) {
            this.subscribe('sessions.device', user._id);
        } else {
            this.subscribe('experiments.user', user._id);
            this.tabs = new ReactiveVar({});
        }
    });
});

Template.sessionWindow.onCreated(function () {
    FlowRouter.go('/session/' + this.data._id);
});
