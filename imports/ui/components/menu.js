import './menu.html';
import '/imports/api/collections';

import {Experiments, Sessions} from '../../api/collections';
import {Howl} from 'howler';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

Template.menu.helpers({
    experiment() {
        return Template.instance().experiments();
    },
    session() {
        return Sessions.find({trials: {$size: 1}});
    },
    url() {
        return this.link;
    }
});

Template.menu.onCreated(function () {
    const user = Meteor.user();
    if (user) {
        if (user.profile.device) {
            this.autorun(() => {
                this.subscribe('sessions.device', 'mqtt://' + user.profile.address);
            });
        } else {
            this.autorun(() => {
                this.experiments = function () {
                    return Experiments.find({});
                };
                this.subscribe('experiments.user', user._id);
            });
        }
    }
});

Template.sessionWindow.onCreated(function () {
    const stage = 1,
        trial = 1,
        tone = new Howl({
            preload: true,
            src: ['/audio/bell.wav']
        });

    FlowRouter.go('/' + this.data._id + '/trial/' + trial + '/stage/' + stage);
    tone.play();
});
