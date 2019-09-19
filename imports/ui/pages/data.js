import './data.html';
import '/imports/ui/components/profile.html';

import '/imports/ui/components/profile';
import '/imports/ui/components/tablesort';

import _ from 'underscore';
import moment from 'moment/moment';

import {Experiments, Sessions, Subjects, Trials} from '/imports/api/collections';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {saveAs} from 'file-saver';

Template.data.events({
    'click #session'(event, template) {
        template.session.set('');
    },
    'click #session-list tr'(event, template) {
        const prev = template.session.get();

        if ((prev !== this._id)) {
            template.subscribe('sessions.single', this._id);
            template.subscribe('trials.session', this._id);

            template.session.set(this._id);
        }
    }
});

Template.data.helpers({
    selected() {
        const id = Template.instance().session.get(),
            session = Sessions.findOne(id);

        if (session) return session;
    }
});

Template.data.onCreated(function () {
    this.counts = new ReactiveVar({});
    this.session = new ReactiveVar('');
});

Template.dataMenu.events({
    'click #download'(event, template) {
        const date = moment(template.data.date),
            experiment = Experiments.findOne(template.data.experiment),
            device = Meteor.users.findOne(template.data.device),
            subjects = _.map(template.data.subjects, (id) => {
                const subject = Subjects.findOne(id);
                if (subject) return subject.identifier;
            }).toString(),
            user = Meteor.users.findOne(template.data.user),
            filename = subjects + '[' + date.format('YY.MM.DD.HH.mm') + '].xls',
            headers = '\nTrial\tStage\tEvent\tTime\n',
            content = [
                'Experiment\t' + experiment.title + '\n',
                'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
                'Subject\t' + subjects + '\n',
                'Device\t' + device.profile.name + '\n',
                'Experimenter\t' + user.profile.name + '\n',
                headers
            ];

        _.each(template.data.trials, (id) => {
            const trial = Trials.findOne(id);

            content.push(trial.number + '\t');

            _.each(trial.data, (stage, i) => {
                content.push(i + 1);

                _.each(stage, (e) => {
                    const timestamp = moment(e.timeStamp).format('HH:mm:ss.SSS');
                    content.push('\t' + e.type + '\t' + timestamp + '\t');
                });

                content.push('\n');
            });

            content.push('\n');
        });

        saveAs(new Blob(content), filename);
    }
});

Template.paginationMenu.events({
    'click #back'(event, template) {
        const page = Template.currentData().page - 1,
            sessions = template.parent();

        /** Must force recreation of sessionList: */
        sessions.page.set(-1);
        sessions.updateMenu(page);
    },
    'click #next'(event, template) {
        const page = Template.currentData().page + 1,
            sessions = template.parent();

        /** Must force recreation of sessionList: */
        sessions.page.set(-1);
        sessions.updateMenu(page);
    }
});

Template.sessionRow.helpers({
    box(id) {
        return Meteor.users.findOne(id);
    },
    subject(subjects) {
        return Subjects.find({_id: {$in: subjects}});
    },
});

// Template.sessionRow.onRendered(function () {
//     const list = Template.instance().parent();
//     list.$('table').tablesort().data('tablesort').sort($("thead th:nth-child(2)"));
// });

Template.sessionsView.helpers({
    limit() {
        return Template.instance().limit.get();
    },
    more() {
        return Template.instance().more.get();
    },
    page() {
        return Template.instance().page.get();
    }
});

Template.sessionList.helpers({
    sessions(id, limit) {
        return Sessions.find({}, {limit: limit});
    }
});

Template.sessionList.onCreated(function () {
    console.log(this);
    this.subscribe('sessions.experiment', this.data.id, {settings: false}, this.data.limit,
        this.data.page * this.data.limit);
});

Template.sessionsView.onCreated(function () {
    this.limit = new ReactiveVar(5);
    this.more = new ReactiveVar(false);
    this.page = new ReactiveVar(0);

    this.subscribe('subjects.experiment', this.data._id);
    this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});

    this.updateMenu = (page) => Meteor.call('countCollection', 'Sessions', (error, count) => {
        if (!error) {
            const limit = this.limit.get(),
                skip = (page + 1) * limit;
            
            this.more.set(skip < count);
            this.page.set(page);
        }
    });
    this.updateMenu(0);
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
    $('table').tablesort();
});

Template.statisticsList.helpers({
    count(trials) {
        return trials.length;
    },
    counts() {
        return Template.instance().parent(2).counts.get();
    }
});

Template.trialList.helpers({
    delay(index, event) {
        const events = Template.parentData(1);

        if (index > 0) {
            const previous = events[index - 1],
                delay = (event.timeStamp || event.context.time) - (previous.timeStamp || previous.context.time);

            return delay.toFixed(3);
        }
    },
    event(request) {
        return _.map(_.pairs(request), (property) => ({
            key: property[0],
            value: (parseFloat(property[1])) ? parseFloat(property[1]).toFixed(3) : property[1]
        }));
    },
    icon(request, sender, type) {
        if (sender || type) {
            const icons = {
                    amount: {
                        dispense: {
                            main: 'teal tint'
                        }
                    },
                    audio: {
                        file: {
                            start: {
                                main: 'green volume up'
                            },
                            stop: {
                                main: 'green volume off'
                            }
                        },
                        noise: {
                            start: {
                                main: 'green volume up'
                            },
                            stop: {
                                main: 'green volume off'
                            }
                        },
                        wave: {
                            start: {
                                main: 'green volume up'
                            },
                            stop: {
                                main: 'green volume off'
                            }
                        }
                    },
                    click: {
                        main: 'olive mouse pointer'
                    },
                    ir: {
                        entry: {
                            main: 'sign in'
                        },
                        exit: {
                            main: 'sign out'
                        }
                    },
                    light: {
                        dim: {
                            fired: {
                                main: 'yellow moon'
                            },
                            sent: {
                                corner: 'yellow moon',
                                main: 'envelope'
                            }
                        },
                        off: {
                            fired: {
                                main: 'yellow lightbulb outline'
                            },
                            sent: {
                                corner: 'yellow lightbulb outline',
                                main: 'envelope'
                            }
                        },
                        on: {
                            fired: {
                                main: 'yellow lightbulb'
                            },
                            sent: {
                                corner: 'yellow lightbulb',
                                main: 'envelope'
                            }
                        }
                    },
                    reward: {
                        off: {
                            fired: {
                                main: 'yellow star outline'
                            },
                            sent: {
                                corner: 'yellow star outline',
                                main: 'envelope'
                            }
                        },
                        on: {
                            fired: {
                                main: 'yellow star'
                            },
                            sent: {
                                corner: 'yellow star',
                                main: 'envelope'
                            }
                        }
                    },
                    session: {
                        end: {
                            main: 'orange hourglass end'
                        },
                        start: {
                            main: 'orange hourglass start'
                        }
                    },
                    trial: {
                        end: {
                            main: 'blue clock'
                        },
                        start: {
                            main: 'blue clock outline'
                        }
                    }
                },
                properties = (!request) ? type.split(/(?:\.[\d]?\.?)+/ig) : _.flatten(_.pairs(request)),
                path = _.property(_.filter(properties, _.isString));

            return path(icons);
        }
    },
    length(trial) {
        return _.flatten(trial).length;
    },
    table() {
        return Template.instance().table.get();
    },
    time(context, timeStamp) {
        return timeStamp || context.time;
    },
    trial(ids) {
        return Trials.find({_id: {$in: ids}});
    }
});

Template.trialList.onCreated(function () {
    const stages = _.flatten(_.unique(this.data.settings.stages,
        (trial) => JSON.stringify(trial)), true);

    this.analyzeTrials = (stages, trials) => {
        const list = [],
            counts = {
                amount: 0,
                clicks: 0,
                dispensed: 0
            };

        if (trials) _.each(trials, (trial) => {
            if (trial) {
                const s = 0,
                    groups = _.map(trial.data, (stage) =>
                        _.groupBy(stage, (element) => (element.type) ? element.type.split('.')[0] : element.sender)),
                    session = _.flatten([groups[s]['session'], groups[s]['trial']]),
                    time = _.groupBy(_.compact(session), (e) => _.last(e.type.split('.'))),
                    types = _.map(stages, (stage, i) => _.map(stage, (e) =>
                        (groups[i][e.type || e.sender] || []))),
                    cells = _.flatten([[time['start']], ...types, [time['end']]], true);

                /** Distribute clicks by timestamp rather than event: */
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
            }
        });

        return {counts: counts, list: list, stages: stages};
    };

    this.table = new ReactiveVar();

    this.autorun(() => {
        const trials = Trials.find({_id: {$in: this.data.trials}}).fetch(),
            table = this.analyzeTrials(stages, trials);

        this.parent(2).counts.set(table.counts);
        this.table.set(table);
    });
});

Template.trialList.onRendered(function () {
    Template.instance().$('table').tablesort().data('tablesort').sort($("th.sorted:first-child"));
});
