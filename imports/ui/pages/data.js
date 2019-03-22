import './data.html';
import '/imports/ui/components/profile.html';

import '/imports/ui/components/profile';
import '/imports/ui/components/tablesort';

import _ from 'underscore';
import moment from 'moment/moment';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Sessions, Trials} from '/imports/api/collections';

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
        return Trials.find({experiment: Template.currentData()._id, subject: 'MouseID'});
    }
});

Template.data.onCreated(function () {
    this.autorun(() => {
        console.log(this.data._id);
        this.subscribe('sessions.experiment', this.data._id);
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});
    });

    this.session = new ReactiveVar('');
});

Template.data.onRendered(function () {
    $('table').tablesort();
    console.log(this);
});

Template.sessionList.helpers({
    box(id) {
        return Meteor.users.findOne(id);
    },
    session(id) {
        return Sessions.find({experiment: id});
    }
});

Template.settingsList.helpers({
    element(stages) {
        return _.flatten(_.unique(stages, (stage) => JSON.stringify(stage)));
    },
    string(property) {
        return (_.isArray(property) || _.isObject(property)) ? JSON.stringify(property) : property;
    },
    text(key) {
        const text = {
            delay: 'Delay (before session start)',
            duration: 'Duration',
            iti: 'Intertrial Interval (ITI)',
            total: 'No. of Trials'
        };

        return (text[key]) ? text[key] : key;
    }
});

Template.settingsList.onRendered(function () {
    $('.ui.accordion').accordion();
});

Template.trialList.helpers({
    events(data) {
        const types = _.map(data, (stage) => _.toArray(_.groupBy(stage, (element) =>
            element.type.endsWith('.fired') || element.type.endsWith('.next'))));
        console.log(data, types, _.flatten(types, true));
        return _.flatten(types, true);
    },
    group(group) {
        return group
    },
    length(trial) {
        return _.flatten(trial).length;
    },
    trial(id) {
        return Trials.findOne(id);
    },
    unique() {
        return Template.instance().unique.get();
    }
});

Template.trialList.onCreated(function () {
    const unique = _.unique(this.data.settings.stages, (trial) => JSON.stringify(trial)),
        measured = _.map(unique, (trial, i) => {
            const stages = _.map(trial, (stage, j) => ({number: j + 1, span: stage.length, stage: stage}));
            return {number: i + 1, span: _.flatten(trial).length, stages: stages};
        });

    this.unique = new ReactiveVar(measured);
});
