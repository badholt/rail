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
    'click #session'(event, template) {
        template.session.set('');
    },
    'click #session-list tr'(event, template) {
        const prev = template.session.get();
        template.session.set((prev !== this._id) ? this._id : '');
    }
});

Template.data.helpers({
    selected() {
        const id = Template.instance().session.get();
        return (id) ? Sessions.findOne(id) : '';
    },
    trials() {
        return Trials.find();
    }
});

Template.data.onCreated(function () {
    this.autorun(() => {
        this.subscribe('sessions.experiment', this.data._id);
        this.subscribe('subjects.experiment', this.data._id);
    });
    this.autorun(() => this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]}));

    this.session = new ReactiveVar('');
});

Template.dataMenu.events({
    'click #download'(event, template) {
        console.log(template);
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

        console.log(content, filename, template);

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

Template.sessionList.helpers({
    box(id) {
        return Meteor.users.findOne(id);
    },
    session(id) {
        return Sessions.find({experiment: id});
    },
    subject(subjects) {
        return Subjects.find({_id: {$in: subjects}});
    },
});

Template.sessionList.onRendered(function () {
    $('table').tablesort();
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

Template.trialList.helpers({
    delay(index, event) {
        const events = Template.parentData(1);

        if (index > 0) {
            const previous = events[index - 1],
                delay = event.timeStamp - previous.timeStamp;

            return delay.toFixed(3);
        }
    },
    events(unique, data) {
        const groups = _.map(data, (stage) =>
                _.groupBy(stage, (element) => element.type.split('.')[0])),
            session = _.flatten([groups[0]['session'], groups[0]['trial']]),
            time = _.groupBy(_.compact(session), (e) => _.last(e.type.split('.'))),
            types = _.map(unique, (stage, i) => _.map(stage, (e) => (groups[i][e.type] || []))),
            cells = _.flatten([[time['start']], ...types, [time['end']]], true);

        /** Distribute clicks by timestamp rather than event: */
        const clicks = _.flatten([groups[0]['click']]);

        let n = 0;
        _.each(cells, (cell) => {
            let click = clicks[n];
            _.each(cell, (e, j, list) => {
                console.log(e, click);
                if (click && click.timeStamp <= e.timeStamp) {
                    list.splice(j, 0, click);
                    click = clicks[n++];
                }
            });
        });

        return cells;
    },
    icon(type) {
        if (type) {
            const icons = {
                    audio: {
                        start: {
                            main: 'green volume up'
                        },
                        stop: {
                            main: 'green volume off'
                        }
                    },
                    click: {
                        main: 'mouse pointer'
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
                properties = type.split(/(?:\.[\d]?\.?)+/ig),
                path = _.property(properties);

            return path(icons);
        }
    },
    length(trial) {
        return _.flatten(trial).length;
    },
    trial(ids) {
        return Trials.find({_id: {$in: ids}});
    },
    unique() {
        return Template.instance().unique.get();
    }
});

Template.trialList.onCreated(function () {
    const stages = _.flatten(_.unique(this.data.settings.stages,
        (trial) => JSON.stringify(trial)), true);

    this.unique = new ReactiveVar(stages);
});

Template.trialList.onRendered(function () {
    $('table').tablesort();
});
