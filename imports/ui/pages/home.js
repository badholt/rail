import './home.html';
import './data';

import {Experiments} from "../../api/collections";
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

Template.accordion.onRendered(function () {
    $('.ui.accordion').accordion({
        exclusive: false
    });
});

Template.accordion.events({
    'input #stimuli-form input'(event) {
        const target = event.target || event.srcElement,
            value = parseInt($('#stimuli-form').form('get value', target.name));

        switch (target.name) {
            case 'number':
                let stages = [{data: [], visuals: []}, {data: [], visuals: []}];

                for (let i = 0; i < value; i++) {
                    stages[1].visuals.push({
                        grid: {
                            blacklist: [
                                [JSON.stringify({x: 1, y: 1}), true],
                                [JSON.stringify({x: 1, y: 2}), true],
                                [JSON.stringify({x: 1, y: 3}), true],
                                [JSON.stringify({x: 2, y: 3}), true],
                                [JSON.stringify({x: 3, y: 1}), true],
                                [JSON.stringify({x: 3, y: 2}), true],
                                [JSON.stringify({x: 3, y: 3}), true],
                            ],
                            x: 3, y: 3
                        }, opacity: 1, spacing: 3, span: 300, weight: 10
                    });
                }

                Session.set('stages', stages);
                Session.set('stimuli', value);
                break;
        }
    },
    'input #trials-form input'(event) {
        const target = event.target || event.srcElement,
            value = $('#trials-form').form('get value', target.name);

        switch (target.name) {
            case 'number':
                Session.set('total', parseInt(value));
                break;
        }
    }
});

Template.experiment.events({
    'click button'() {
        const experiment = this._id,
            stage = Session.get('stage'),
            stages = Session.get('stages'),
            trial = Session.get('trial');

        Meteor.call('addSession', experiment, function (error, session) {
            if (!error) {
                Meteor.call('addTrial', experiment, trial, session, stages[1]);
                FlowRouter.go('/' + session + '/trial/' + trial + '/stage/' + stage);
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
        this.subscribe('trials', this.getExperiment(this.experiment()));
    });
});
