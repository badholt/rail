import './home.html';
import '../components/accordion';
import '../components/data';

import {Experiments} from "../../api/collections";
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Howl} from 'howler';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

Template.experiment.events({
    'click button'() {
        const devices = $('#device-form .ui.dropdown').dropdown('get value'),
            experiment = this._id,
            stage = Session.get('stage'),
            stages = Session.get('stages'),
            trial = Session.get('trial');

        Meteor.call('addSession', devices, experiment, function (error, session) {
            if (!error) {
                const tone = new Howl({
                    preload: true,
                    src: ['/audio/bell.wav']
                });

                Meteor.call('addTrial', experiment, trial, session, stages[1]);
                FlowRouter.go('/' + session + '/trial/' + trial + '/stage/' + stage);

                tone.play();
            }
        });
    }
});

Template.experiment.helpers({
    info() {
        return Template.instance().experiment();
    }
});

Template.experiment.onCreated(function () {
    this.getLink = () => FlowRouter.getParam('link');

    this.autorun(() => {
        this.getExperiment = function (experiment) {
            if (experiment && experiment._id) return experiment._id;
        };
        this.experiment = function () {
            return Experiments.findOne({link: '/experiments/' + this.getLink()});
        };

        this.subscribe('sessions', this.getExperiment(this.experiment()));
        this.subscribe('status.online');
        this.subscribe('trials', this.getExperiment(this.experiment()));
    });
});
