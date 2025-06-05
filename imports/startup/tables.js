import _ from "underscore";
import Tabular from 'meteor/aldeed:tabular';

import { Meteor } from 'meteor/meteor';
import { Sessions, Trials } from '/imports/api/collections';
import { Template } from 'meteor/templating';

const sessions = new Tabular.Table({
    autoWidth: false,
    name: 'Sessions',
    collection: Sessions,
    columns: [
        { data: 'subjects', title: 'Subject(s)', tmpl: Meteor.isClient && Template.subjectsCell },
        { data: 'date', title: 'Date & Time', tmpl: Meteor.isClient && Template.dateCell },
        {
            data: 'device',
            title: 'Device',
            tmpl: Meteor.isClient && Template.deviceCell,
            tmplContext(session) { return Meteor.users.findOne(session.device); }
        },
        { data: 'user', title: 'User', tmpl: Meteor.isClient && Template.userCell }
    ],
    dom: '<<i>t<"ui equal width grid"<"column"l><"right aligned column"p>>>',
    extraFields: ['date', 'device', 'lastModified'],
	language: {
        info: '<h3 class="ui inverted right floated grey sub header">Sessions '
            + '<label class="ui horizontal label">_START_</label> to '
            + '<span class="ui horizontal label">_END_</label></h3>',
        lengthMenu: '<span class="ui inverted segment">View</span> <select>'
            + '<option value="10">10</option>'
            + '<option value="25">25</option>'
            + '<option value="50">50</option>'
            + '<option value="-1">All</option>'
            + '</select>',
		select: {
			rows: {
				_: '%d sessions selected',
				0: 'Click a row to print a session',
				1: '1 session selected'
			}
		}
	},
    pub: 'sessions.table',
    responsive: true,
    searching: false,
	select: {
		className: 'active',
		info: true,
        items: 'row',
        keys: true,
		style: 'multi+shift',
		toggleable: true
	},
    throttleRefresh: 5000
});

const trials = new Tabular.Table({
    autoWidth: false,
    buttonContainer: '.row.dt-table',
    buttons: ['colvis', 'copy', 'csv', 'excel', 'print'],
    name: 'Trials',
    collection: Trials,
    columns: [
        {data: 'number', title: 'No.'},
        {
            data: 'data', title: 'Trial', tmpl: Meteor.isClient && Template.trialCell, tmplContext(trial) {
                const stages = _.flatten(_.unique(trial.stages, (trial) => JSON.stringify(trial)), true);

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

export { sessions, trials }
