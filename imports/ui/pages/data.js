import './data.html';
import '/imports/ui/components/profile.html';

import '/imports/ui/components/profile';
import '/imports/ui/components/tablesort';
import '/imports/startup/tables';

import autofill from 'datatables.net-autofill-se';
import buttons from 'datatables.net-buttons-se';
import colVis from 'datatables.net-buttons/js/buttons.colVis';
import keytable from 'datatables.net-keytable-se';
import print from 'datatables.net-buttons/js/buttons.print';
import responsive from 'datatables.net-responsive-se';
import rowgroup from 'datatables.net-rowgroup-se';
import select from 'datatables.net-select-se';
import semantic from 'datatables.net-se';

import _ from 'underscore';
import moment from 'moment/moment';

import {$} from 'meteor/jquery';
import {Experiments, Sessions, Subjects, Trials} from '/imports/api/collections';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {saveAs} from 'file-saver';

Template.data.events({
    'click #session'(event, template) {
        template.session.set('');
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

Template.deviceCell.helpers({
    box(id) {
        return Meteor.users.findOne(id);
    }
});

Template.sessionsView.events({
    'click tbody > tr'(event, template) {
        const prev = template.parent().session.get(),
            table = template.$('table').DataTable(),
            session = table.row(event.currentTarget).data();

        if (prev !== session._id) template.parent().session.set(session._id);
    }
});

Template.sessionsView.helpers({
    filters() {
        const filters = {
            subjects: {subjects: {$all: [""]}}
        };

        return {};
    }
});

Template.sessionsView.onCreated(function () {
    this.subscribe('subjects.experiment', this.data._id);
    this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});

    autofill(window, $);
    buttons(window, $);
    colVis(window, $);
    keytable(window, $);
    print(window, $);
    responsive(window, $);
    rowgroup(window, $);
    select(window, $);
    semantic(window, $);
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
        if (trials) return trials.length;
    },
    counts() {
        return Template.instance().parent(2).counts.get();
    }
});

Template.subjectsCell.helpers({
    subject(subjects) {
        return Subjects.find({_id: {$in: subjects}});
    },
});

//TODO Determine whether or not this template will be used, resolving confusion
// Template.trialCell.helpers({
//     delay(index, event) {
//         const events = Template.parentData(1);
//
//         if (index > 0) {
//             const previous = events[index - 1],
//                 delay = event.timeStamp - previous.timeStamp;
//
//             return delay.toFixed(3);
//         }
//     },
//     event(request) {
//         return _.map(_.pairs(request), (property) => ({
//             key: property[0],
//             value: (parseFloat(property[1])) ? parseFloat(property[1]).toFixed(3) : property[1]
//         }));
//     },
//     icon(request, sender, type) {
//         console.log('trial cell', request, sender, type);
//         if (sender || type) {
//             const icons = {
//                     amount: {
//                         dispense: {
//                             main: 'teal tint'
//                         }
//                     },
//                     audio: {
//                         file: {
//                             start: {
//                                 main: 'green volume up'
//                             },
//                             stop: {
//                                 main: 'green volume off'
//                             }
//                         },
//                         noise: {
//                             start: {
//                                 main: 'green volume up'
//                             },
//                             stop: {
//                                 main: 'green volume off'
//                             }
//                         },
//                         wave: {
//                             start: {
//                                 main: 'green volume up'
//                             },
//                             stop: {
//                                 main: 'green volume off'
//                             }
//                         }
//                     },
//                     click: {
//                         main: 'olive mouse pointer'
//                     },
//                     ir: {
//                         entry: {
//                             main: 'sign in'
//                         },
//                         exit: {
//                             main: 'sign out'
//                         }
//                     },
//                     lights: {
//                         dim: {
//                             fired: {
//                                 main: 'yellow moon'
//                             },
//                             sent: {
//                                 corner: 'yellow moon',
//                                 main: 'envelope'
//                             }
//                         },
//                         off: {
//                             fired: {
//                                 main: 'yellow lightbulb outline'
//                             },
//                             sent: {
//                                 corner: 'yellow lightbulb outline',
//                                 main: 'envelope'
//                             }
//                         },
//                         on: {
//                             fired: {
//                                 main: 'yellow lightbulb'
//                             },
//                             sent: {
//                                 corner: 'yellow lightbulb',
//                                 main: 'envelope'
//                             }
//                         }
//                     },
//                     reward: {
//                         dispense: {
//                             fired: {
//                                 main: 'yellow star outline'
//                             },
//                             sent: {
//                                 corner: 'yellow star outline',
//                                 main: 'envelope'
//                             }
//                         },
//                         off: {
//                             fired: {
//                                 main: 'yellow star outline'
//                             },
//                             sent: {
//                                 corner: 'yellow star outline',
//                                 main: 'envelope'
//                             }
//                         },
//                         on: {
//                             fired: {
//                                 main: 'yellow star'
//                             },
//                             sent: {
//                                 corner: 'yellow star',
//                                 main: 'envelope'
//                             }
//                         }
//                     },
//                     session: {
//                         end: {
//                             main: 'orange hourglass end'
//                         },
//                         start: {
//                             main: 'orange hourglass start'
//                         }
//                     },
//                     trial: {
//                         end: {
//                             main: 'blue clock'
//                         },
//                         start: {
//                             main: 'blue clock outline'
//                         }
//                     }
//                 },
//                 properties = (!request) ? type.split(/(?:\.[\d]?\.?)+/ig) : _.flatten(_.pairs(request)),
//                 path = _.property(_.filter(properties, _.isString));
//             return path(icons);
//         }
//     }
// });

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
        console.log(request, sender, type);
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
                        dispense: {
                            fired: {
                                main: 'yellow trophy'
                            },
                            sent: {
                                corner: 'yellow trophy',
                                main: 'envelope'
                            }
                        },
                        off: {
                            corner: 'dont',
                            fired: {
                                main: 'yellow trophy'
                            },
                            main: 'teal tint',
                            sent: {
                                corner: 'yellow trophy',
                                main: 'envelope'
                            }
                        },
                        on: {
                            corner: 'play',
                            fired: {
                                main: 'yellow trophy'
                            },
                            main: 'teal tint',
                            sent: {
                                corner: 'yellow trophy',
                                main: 'envelope'
                            }
                        }
                    },
                    session: {
                        abort: {
                            main: 'orange dont abort'
                        },
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
                properties = (!request)
                    ? type.split(/(?:\.[\d]?\.?)+/ig)
                    : _.filter(_.flatten(_.pairs(request)), _.isString),
                path = _.property(_.filter(properties, (string) => !parseInt(string)));
            console.log(properties, path(icons));
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
                dispensed: 0,
                ir: {
                    delays: [],
                    entries: [],
                    exits: [],
                },
                tones: []
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
                    cells = _.flatten([[time['start']], ...types, [time['end'] || time ['abort']]], true);

                /** Distribute clicks by timestamp rather than event: */
                const clicks = _.flatten([groups[s]['click']]);
                if (clicks) counts.clicks += _.compact(clicks).length;

                let n = 0,
                    firstEntry = 0,
                    lastTone = 0;

                _.each(cells, (cell) => {
                    let click = clicks[n];

                    _.each(cell, (e, j, list) => {
                        if (click && click.timeStamp <= e.timeStamp) {
                            list.splice(j, 0, click);
                            click = clicks[n++];
                        } else if (e.type.startsWith('audio')) {
                            if (!lastTone) {
                                if (e.type.endsWith('start')) {
                                    counts.tones.push(e.timeStamp);
                                    lastTone = e.timeStamp;
                                    // console.log('%caudio:\t', 'color: blue;', e, lastTone);
                                }
                                if (e.type.endsWith('stop')) {
                                    // console.log('%caudio:\t', 'color: red;', e, lastTone);
                                }
                            }
                        } else if (e.type === 'reward') {
                            if (_.has(e.request, 'ir')) {
                                if (!firstEntry) {
                                    if (e.request.ir === 'entry') {
                                        // console.log('%cIR:\t', 'color: purple;', e);
                                        counts.ir.entries.push(e.timeStamp);
                                        firstEntry = e.timeStamp;
                                    } else {
                                        // console.log('%cIR:\t', 'color: violet;', e);
                                        counts.ir.exits.push(e.timeStamp);
                                    }
                                }
                            } else if (_.has(e.request, 'dispense')) {
                                counts.amount += e.request['amount'];
                                counts.dispensed += e.request['dispense'];
                            }
                        }
                    });
                });

                if (firstEntry && lastTone && firstEntry - lastTone > 0) counts.ir.delays.push(firstEntry - lastTone);
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

Template.trialsView.onCreated(function () {
    this.subscribe('sessions.single', this.data._id);
    this.subscribe('trials.session', this.data._id);
});
