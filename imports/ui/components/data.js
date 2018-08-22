import './data.html';
import './profile.html';
import './profile';
import './tablesort';

import {saveAs} from 'file-saver';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Sessions, Trials} from '/imports/api/collections';
import moment from "moment/moment";

const fs = require('fs');

Template.clickList.helpers({
    stage() {
        return [{title: 'Cross', helper: this.stages[0].data},
            {title: 'Lines', helper: this.stages[1].data}];
    }
});

Template.data.events({
    'click tr'(e, template) {
        const date = moment(this.date).format('MMMM-Do-HHmm'),
            filename = this.subject + '-' + date + '.json',
            content = ['Session ' + this._id, JSON.stringify(this, null, 2)];

        _.each(this.trials, (id) => {
            const trial = Trials.findOne(id);
            _.each(trial.stages, (stage) => {
                content.push('\nTrial ' + trial._id);
                content.push(JSON.stringify(stage.data, null, 2));
            });
        });

        saveAs(new Blob(content), filename);
    }
});

Template.data.helpers({
    trials() {
        console.log(this);
        return Trials.find({experiment: this._id, subject: 'MouseID'});
    }
});

Template.data.onCreated(function () {
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
        return Meteor.users.findOne({'profile.address': address.replace('mqtt://', ''), 'profile.device': true});
    },
    session() {
        return Sessions.find({experiment: this._id});
    }
});
