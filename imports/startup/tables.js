import Tabular from 'meteor/aldeed:tabular';

import {Meteor} from 'meteor/meteor';
import {Sessions, Trials} from '/imports/api/collections';
import {Template} from 'meteor/templating';
import _ from "underscore";

new Tabular.Table({
    autoWidth: false,
    buttonContainer: '.row.dt-table',
    buttons: ['colvis', 'copy', 'csv', 'excel', 'print'],
    name: "Sessions",
    collection: Sessions,
    columns: [
        {data: 'subjects', title: 'Subject(s)', tmpl: Meteor.isClient && Template.subjectsCell},
        {data: 'date', title: 'Date & Time', tmpl: Meteor.isClient && Template.dateCell},
        {
            data: 'device',
            title: 'Device',
            tmpl: Meteor.isClient && Template.deviceCell,
            tmplContext(doc) {
                return Meteor.users.findOne(doc.device);
            }
        },
        {data: 'user', title: 'User', tmpl: Meteor.isClient && Template.userCell}
    ],
    extraFields: ['date', 'device', 'lastModified'],
    order: [[1, 'desc']],
    ordering: true,
    responsive: true,
    searching: false,
    throttleRefresh: 5000
});

new Tabular.Table({
    autoWidth: false,
    buttonContainer: '.row.dt-table',
    buttons: ['colvis', 'copy', 'csv', 'excel', 'print'],
    name: "Trials",
    collection: Trials,
    columns: [
        {data: 'number', title: 'No.'},
        {
            data: 'data', title: 'Trial', tmpl: Meteor.isClient && Template.trialCell, tmplContext(trial) {
                const stages = _.flatten(_.unique(trial.stages, (trial) => JSON.stringify(trial)), true);
                console.log(this, trial, stages);
                if (_.size(_.flatten(trial.data)) && stages) {
                    const list = [], counts = {
                            amount: 0,
                            clicks: 0,
                            dispensed: 0
                        }, s = 0,
                        groups = _.map(trial.data, (stage) =>
                            _.groupBy(stage, (element) => (element.type) ? element.type.split('.')[0] : element.sender)),
                        session = _.flatten([groups[s]['session'], groups[s]['trial']]),
                        time = _.groupBy(_.compact(session), (e) => _.last(e.type.split('.'))),
                        types = _.map(trial.stages, (stage, i) => _.compact(_.map(stage, (e) => {
                            const group = e.type || e.sender;
                            return (group !== 'click') ? groups[i][group] : false;
                        }))),
                        cells = _.flatten([[time['start']], ...types, [time['end']]], true);

                    // /** Distribute clicks by timestamp rather than event: */
                    const clicks = _.flatten([groups[s]['click']]);
                    if (clicks) counts.clicks += _.compact(clicks).length;

                    let n = 0;
                    _.each(cells, (cell) => {
                        let click = clicks[n];
                        _.each(cell, (e, j, list) => {
                            if (click && click.timeStamp <= e.timeStamp) {
                                list.splice(j, 0, click);
                                click = clicks[n++];
                            } else if (_.has(e.request, 'dispense')) {
                                counts.amount += e.request['amount'];
                                counts.dispensed += e.request['dispense'];
                            }
                        });
                    });

                    console.log('cells:\t', cells, counts, groups, types);
                    list.push(cells);

                    return cells;
                }
            }
        }
    ],
    extraFields: ['stages'],
    responsive: true,
    searching: false,
    throttleRefresh: 5000
});
