import './data.html';
import './profile.html';
import './profile';
import './tablesort';

import _ from 'underscore';
import moment from 'moment/moment';

import {correctEvent} from '/imports/ui/pages/trial';
import {saveAs} from 'file-saver';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Experiments, Sessions, Trials} from '/imports/api/collections';

const fs = require('fs'),
    analyzeData = function (comparisons, stages) {
        let analyses = [],
            prev;

        _.each(stages, (stage, i) => {
            analyses.push([]);

            _.each(stage.data, (e, j) => {
                const time = comparisons.time;
                let d = {
                    event: j,
                    stage: i
                };

                if (prev) _.each(time, (key) => d[key] = (prev[key])
                    ? moment(e[key]).diff(moment(prev[key]))
                    : moment(e[key]));
                console.log(prev, e);

                if (_.size(d) > 2) analyses[i].push(d);
                prev = e;
            });

            return stage;
        });

        return _.chain(stages).map((stage, i) => _.extend(stage, {order: i + 1}))
            .zip(_.map(analyses, (element) => ({analysis: element}))).flatten(true).value();
    };

Template.data.events({
    'click #session'(e, template) {
        template.session.set('');
    },
    'click #session-list tr'(e, template) {
        const prev = template.session.get();
        template.session.set((prev !== this._id) ? this._id : '');
        // const date = moment(this.date),
        //     device = Meteor.users.findOne({'profile.address': this.device.replace('mqtt://', '')}),
        //     experiment = Experiments.findOne(this.experiment),
        //     subject = this.subject,
        //     user = Meteor.users.findOne({_id: this.user}),
        //     filename = subject + '-' + date.format('YYYY-MM-DD-HHmm') + '.xls',
        //     headers = '\nTrial\tEvents\n',
        //     content = [
        //         'Experiment\t' + experiment.title + '\n',
        //         'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
        //         'Subject\t' + subject + '\n',
        //         'Device\t' + device.profile.name + '\n',
        //         'Experimenter\t' + user.profile.name + '\n',
        //         headers
        //     ];
        //
        // _.each(this.trials, (id) => {
        //     const trial = Trials.findOne(id);
        //     content.push(trial._id);
        //     _.each(trial.stages, (stage, i) => {
        //         content.push('\tStage ' + (i + 1) + '\n');
        //         _.each(stage.data, (e) => {
        //             const click = '(' + e.screenX + ', ' + e.screenY + ')',
        //                 timestamp = moment(e.timeStamp).format('HH:mm:ss.SSS');
        //             content.push('\t' + click + '\t' + timestamp + '\t\n');
        //         });
        //     });
        // });
        //
        // saveAs(new Blob(content), filename);
    }
});

Template.data.helpers({
    selected() {
        const id = Template.instance().session.get();
        return (id) ? Sessions.findOne(id) : '';
    },
    trials() {
        console.log(this);
        return Trials.find({experiment: this._id, subject: 'MouseID'});
    }
});

Template.data.onCreated(function () {
    this.session = new ReactiveVar('');

    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': true}]});
    });
});

Template.data.onRendered(function () {
    $('table').tablesort();
});

Template.sessionList.helpers({
    box(address) {
        return Meteor.users.findOne({'profile.device': true, 'profile.address': address.replace('mqtt://', '')});
    },
    session() {
        return Sessions.find({experiment: this._id});
    }
});

Template.trialList.helpers({
    analyses(trial) {
        const analysis = Template.instance().analysis.get();
        console.log(analysis);
        return analysis[trial - 1];
    },
    comparisons() {
        return {
            time: ['timeStamp']
        };
    },
    correct(data) {
        // console.log(this, Template.instance());
    },
    max() {
        return _.max(_.map(this.settings, (trial) => trial.length));
    },
    trial() {
        return Trials.find({session: this._id});
    }
});

Template.trialList.onCreated(function () {
    this.analysis = new ReactiveVar([]);
});

Template.trialList.onRendered(function () {
    Trials.find({_id: {$in: this.data.trials}}).forEach((trial) => {
        const analyses = Template.instance().analysis.get(),
            comparisons = {
                time: ['timeStamp']
            },
            stages = trial.stages;

        analyses.push(analyzeData(comparisons, stages));
        Template.instance().analysis.set(analyses);
    });
});
