import './data.html';
import '/imports/ui/components/profile.html';

import '/imports/ui/components/dropdown/data';
import '/imports/ui/components/dropdown/files';
import '/imports/ui/components/profile';
import '/imports/ui/components/tablesort';
import '/imports/startup/tables';

import _ from 'underscore';
import moment from 'moment/moment';

import { $ } from 'meteor/jquery';
import { alert } from './run';
import { Experiments, Sessions, Subjects, Trials } from '/imports/api/collections';
import { flipOrientation } from './trial';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { saveAs } from 'file-saver';

Template.data.events({
    'click #session'(_event, template) {
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
    this.dataTemplate = new ReactiveVar('');
    this.format = new ReactiveVar('csv');
    this.precision = new ReactiveVar(true);
    this.session = new ReactiveVar('');
    this.selected = new ReactiveVar([]);
});

Template.dataMenu.events({
    'click #delete'(_event, template) {
        const table = template.parent().$('table').DataTable(),
            selected = table.rows('.active').data(),
            ids = _.pluck(selected, '_id'),
            confirmDelete = (selected) => $.toast({
                message: 'Please confirm - deleted data will be nonrecoverable!',
                title: `Deleting ${ selected }`,
                displayTime: 0,
                class: 'black centered',
                classActions: 'attached',
                className: { message: 'italicized' },
                position: 'bottom attached',
                showIcon: 'warning',
                  actions: [
                    {
                        text: `✓ Delete ${ selected }`,
                        class: 'green',
                        click: () => deleteSelected(ids)
                    },
                    {
                        text: '🚫 Cancel',
                        class: 'red'
                    }
                ]
            }),
            deleteSelected = (ids) => _.each(ids, (id) => Meteor.subscribe('sessions.single', id, { onReady: () => {
                Meteor.subscribe('trials.session', id, { onReady: () => {
                    const session = Sessions.findOne(id);

                    /** Along w/ the session, delete all trials: */
                    if (session.trials) return Meteor.call('removeTrials', session.trials, (error, n) => {
                        if (error) return alert('error', 'Deletion Failure', 'Trials could not be deleted.');
                        removeSession(id, session.trials.length);
                    });

                    /** Delete empty sessions w/ no trials: */
                    removeSession(id, 0);
                }});
            }})),
            removeSession = (id, trials) => Meteor.call('removeSession', id, (error) => {
                if (error) return alert('error', 'Deletion Failure', 'Session could not be deleted.');
                alert('success', 'Deletion Success', (trials > 0) ? `Session & All ${ trials } trials were removed.`
                    : `Empty session was removed.`);
            });

        confirmDelete(`${ selected.length } session${ (selected.length > 1) ? 's': ''}`);
    },
    'click #download'(_event, template) {
        let axis, headers, events, content;

        const defaultContent = (data, headers = false) => {
                const device = Meteor.users.findOne(data.device),
                    experiment = Experiments.findOne(data.experiment),
                    user = Meteor.users.findOne(data.user),
                    subjects = getSubjects(data.subjects),
                    content = [
                        `Experiment\t${ experiment.title }\n`,
                        `Date\t${ moment(data.date).format('dddd, MMMM Do HH:mm') }\n`,
                        `Subject\t${ subjects }\n`,
                        `Device\t${ device.profile.name }\n`,
                        `Experimenter\t${ user.profile.name }\n`                            
                    ];

                if (headers) content.push(`${ headers.join('\t') }\n`);
                return content;
            },
            getGroups = (stage) => {
                const p = [ 'request', 'ir' ];
                return _.groupBy(stage, (e) => ((_.property(p)(e) !== undefined)
                    ? `${ p.join('.')}.${_.property(p)(e) }`
                    : e.type.replace(/(\.?(re)?[\d]+\.)+/ig, '.')));
            },
            getSubjects = (subjects) => _.map(subjects, (id) => {
                    const subject = Subjects.findOne(id);
                    if (subject) return subject.identifier;
                }).toString(),
            getTime = (time, origin = 0, relative = true, readable = false) => {
                if (!time) return;
                const precision = template.parent(2).precision.get();

                if (precision && !readable) {
                    return (relative) ? time : time - origin;
                } else {
                    const epoch = (relative) ? time + origin : time;
                    return new Date(epoch).toLocaleTimeString("en-US", {
                        hour: 'numeric',
                        hour12: false,
                        minute: 'numeric',
                        second: 'numeric',
                        fractionalSecondDigits: 3
                    });
                }
            },
            print = (session) => {
                    const device = Meteor.users.findOne(session.device),
                        screen = device.profile.calibration.screen,
                        height = screen.dimensions.height,
                        width = screen.dimensions.width,
                        dataTemplate = template.parent(2).dataTemplate.get(),
                        format = template.$('#formats').dropdown('get value'),
                        filename = `${ getSubjects(session.subjects) }[${ moment(session.date).format('YY.MM.DD.HH.mm') }]`
                            + `[${ dataTemplate }].${ format }`,
                        rules = _.filter(session.settings.inputs[ 0 ], (i) => (i.event === 'click')),
                        addClicks = (correct, cross, origin = false) => {
                            const c = correct.true,
                                f = correct.false,
                                click = (c) ? c[ 0 ] : (f) ? f[ 0 ] : '',
                                t = (origin) ? getTime(click.timeStamp, origin) : click.timeStamp;

                            content.push((t) ? `${ t }\t` : '\t');
                            content.push((f) ? `${ f.length }\t` : `${ 0 }\t`);
                            content.push((cross) ? `${ cross.length }\t` : `${ 0 }\t`);
                        },
                        addCorrect = (clicks, region, stimulus, axis = 'x', bias = false) => {
                            let correct = {};

                            if (stimulus?.orientation) {
                                const orientation = (!bias) ? stimulus.orientation.value : flipOrientation(stimulus.orientation.value);

                                if (orientation === 0) {
                                    content.push('V\t');
                                    if (clicks.length > 0) correct = _.groupBy(clicks, (c) => isLess(c, region, axis));
                                } else {
                                    content.push('H\t');
                                    if (clicks.length > 0) correct = _.groupBy(clicks, (c) => !isLess(c, region, axis));
                                }

                                content.push((clicks.length > 0) ? _.has(correct, 'true') ? '0\t' : '1\t' : '2\t');
                            } else {
                                content.push('-\t-\t');
                            }

                            return correct;
                        },
                        addOrigin = (trial, headers = false) => {
                            content.push(`Time Origin\t${ trial.timeOrigin }\n`);
                            content.push(`\t${ getTime(trial.timeOrigin, 0, false, true) }\n\n`);
                            if (headers) content.push(`${ headers.join('\t') }\n`);
                        },
                        getClickType = (e, region) =>
                            (isCross(e, region, 'y')
                                ? isCross(e, region, 'x') ? 'mm'
                                : (isLess(e, region, 'x') ? 'lm' : 'rm')
                            : isLess(e, region, 'y')
                                ? (isLess(e, region, 'x') ? 'lt' : 'rt')
                                : (isLess(e, region, 'x') ? 'lb' : 'rb')),
                        getIR = (groups, filter = dataTemplate, key = 'request.ir.0') => {
                            const fn = {
                                    'sensor': () => (true), // Return all
                                    'shaping1': (e) => { // Shaping 1
                                        if (groups[ 'audio.start' ]) {
                                            const tone = groups[ 'audio.start' ][ 0 ];
                                            return (tone) ? (e.timeStamp - tone.timeStamp) > 0 : false; // Any ir event after only (reward) tone
                                        }
                                    },
                                    'shaping2': (e) => { // Shaping 2
                                        if (groups[ 'audio.start' ]) {
                                            const tone = (groups[ 'audio.start' ].length > 1) ? groups[ 'audio.start' ][ 1 ] : false;
                                            return (tone) ? (e.timeStamp - tone.timeStamp) > 0 : false; // Any ir event after 2nd (reward) tone
                                        }
                                    },
                                    'shaping4': (e) => { // Shaping 4, 4v, 6, & 6v
                                        const on = _.find(groups.reward, (r) => (r.request.reward === "on"));
                                        return (on) ? (e.timeStamp - on.timeStamp) > 150 : false; // Any ir event after 150ms post-reward "flicker" period
                                    }
                                };

                            return _.filter(groups[ key ], (e) => fn[ filter ](e)); // TODO: Generalize to more groups & indices (sensor template)
                        },
                        getRegions = (rules) => _.map(rules, (r) => {
                            const getAxis = (p) => p.replace('client', '').toLowerCase();
                            let region = { x: {}, y: {} };

                            _.each(r.conditions, (c) => {
                                let axis, property = {};

                                if (c.comparison === '<') {
                                    _.each(c.objects, (o) => (o.name === 'number') ? property.min = o.property : axis = getAxis(o.property));
                                    _.each(c.subjects, (s) => (s.name === 'number') ? property.max = s.property : axis = getAxis(s.property));
                                }

                                if (axis) region[ axis ] = _.extend(region[ axis ] || {}, property);
                            });

                            /** Default to middle of screen if no bounds given: */
                            region = _.mapObject(region, (r, key) => (!_.isEmpty(r)) ? r
                                : (key === 'x') ? { min: width / 2, max: width / 2 } : { min: height / 2, max: height / 2 });

                            return region;
                        }),
                        region = _.first(getRegions(rules)), // TODO: Generalize for multirule paradigms
                        isCross = (coordinate, region, axis) =>
                            (coordinate[ `client${ axis.toUpperCase() }` ] > region[ axis ].min
                            && coordinate[ `client${ axis.toUpperCase() }` ] < region[ axis ].max),
                        isLess = (coordinate, region, axis) => (coordinate[ `client${ axis.toUpperCase() }` ] < region[ axis ].max);

                    switch (dataTemplate) {
                        case 'indices':
                            headers = [ 'Trial No', 'Trial Index' ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id);

                                if (n === 0) addOrigin(trial, headers);
                                
                                content.push(`${ trial.number }\t`);
                                content.push(`${ trial.index }\t\n`);
                            });

                            break;
                        case 'mqtt':
                            headers = [ 'Trial No', 'Message(s)' ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id);

                                if (n === 0) addOrigin(trial, headers);

                                _.each(trial.data, (stage) => {
                                    const cmds = _.filter(stage, (e) => ((/(.sent)|(.fired)$/g).test(e.type))),
                                        services = _.groupBy(cmds, (e) => (e.type.split('.')[ 0 ])),
                                        msgs = _.filter(stage, (e) => (_.has(services, e.type.split('.')[0])));

                                    if (_.size(msgs) > 0) {
                                        content.push(`${ trial.number }\t`);
                                        _.each(msgs, (e) => (content.push(`${ e.type } ${ 
                                            (e.request) ? JSON.stringify(_.omit(e.request, 'timeStamp')) : '' }\t`)));
                                        content.push('\n\t');
                                        _.each(msgs, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                        content.push('\n');
                                    }
                                });
                            });

                            break;
                        case 'responses':
                            headers = [ 'Trial No' ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id),
                                    clicks = _.map(trial.data, (stage) => _.filter(stage, (e) => (e.type === 'click')));

                                if (n === 0) addOrigin(trial, headers);
                                
                                content.push(`${ trial.number }\t`);
                                
                                _.each(clicks, (stage) => _.each(stage, (e) =>  content.push(
                                    getClickType(e, region) + ' (' + e.clientX + ', ' + e.clientY + ')\t'
                                    + getTime(e.timeStamp, trial.timeOrigin) + '\t')));
                                
                                content.push('\n');
                            });

                            break;
                        case 'reward':
                            headers = [ 'Trial No', 'Dispense Time', 'Amount Dispensed', 'TimeStamp' ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id);
                                let amount = 0,
                                    dispense = 0,
                                    timeStamps = [];

                                if (n === 0) addOrigin(trial, headers);

                                _.each(trial.data, (stage, i) => {
                                    const groups = getGroups(stage, i);

                                    if (groups.reward) _.each(groups.reward, (e) => {
                                        if (e.request.dispense) {
                                            amount += ((e.request.dispense - device.profile.calibration.water.intercept) / device.profile.calibration.water.slope);
                                            dispense += e.request.dispense;

                                            if (e.timeStamp) timeStamps.push(getTime(e.timeStamp, trial.timeOrigin));
                                        }
                                    });
                                });

                                content.push(`${ trial.number }\t`);
                                content.push(`${ dispense }\t`);
                                content.push(`${ amount }\t`);

                                _.each(timeStamps, (timeStamp) => (content.push(`${ getTime(timeStamp, trial.timeOrigin) }\t`)));

                                content.push('\n');
                            });

                            break;
                        case 'sensor':
                            headers = [ 'Trial', 'Stage', 'Sensor Status', 'TimeStamp' ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id);

                                if (n === 0) addOrigin(trial, headers);

                                _.each(trial.data, (stage, i) => {
                                    const groups = getGroups(stage, i),
                                        ir = getIR(groups, dataTemplate);

                                    content.push(`${ trial.number }\t${ i + 1 }`);
                                    if (ir) _.each(ir, (e) => (content.push(`\t${ e.status }\t${ getTime(e.timeStamp, trial.timeOrigin) }`)));
                                    content.push('\n');
                                });
                            });

                            break;
                        case 'settings': {
                            headers = [ 'Stage', 'Rule', 'Event' ];
                            content = defaultContent(session);

                            content.push('Session\n');
                            _.each(session.settings.session, (value, key) => { content.push(`${ key }\t${ value }\n`); });

                            const compare = (condition, indent) => {
                                    _.each(condition.objects, (object) => {
                                        _.times(indent, () => content.push('\t'));
                                        content.push(object.name);

                                        if (_.isObject(object.property)) {
                                            content.push('\n');

                                            _.each(object.property, (value, key) => {
                                                if (key !== 'conditions') {
                                                    _.times(indent + 1, () => content.push('\t'));
                                                    content.push(`${key}\t${value}\n`);
                                                } else {
                                                    _.each(object.property.conditions, (c) => compare(c, indent + 1));
                                                    content.push('\n');
                                                }
                                            });
                                        } else {
                                            content.push(`\t${object.property}\n`);
                                        }
                                    });

                                    _.times(indent, () => content.push('\t'));
                                    content.push(`${condition.comparison}\n`);

                                    _.each(condition.subjects, (subject) => {
                                        _.times(indent, () => content.push('\t'));
                                        content.push(subject.name);

                                        if (_.isObject(subject.property)) {
                                            content.push('\n');
                                            
                                            _.each(subject.property, (value, key) => {
                                                if (key !== 'conditions') {
                                                    _.times(indent + 1, () => content.push('\t'));
                                                    content.push(`${key}\t${value}\n`);
                                                } else {
                                                    _.each(subject.property.conditions, (c) => compare(c, indent + 1));
                                                    content.push('\n');
                                                }
                                            });
                                        } else {
                                            content.push(`\t${subject.property}\n`);
                                        }
                                    });
                                },
                                properties = (target, indent) => {
                                    if (_.isObject(target)) {
                                        _.each(target, (value, key) => {
                                            _.times(indent, () => content.push('\t'));
                                            content.push(key);

                                            if (!_.isObject(value)) {
                                                content.push(`\t${value}\n`);
                                            } else {
                                                content.push('\n');
                                                properties(value, indent + 1);
                                            }
                                        });
                                    } else {
                                        _.times(indent, () => content.push('\t'));
                                        content.push(`${target}\n`);
                                    }
                                };

                            content.push(`\n${ headers.join('\t') }`);

                            _.each(session.settings.inputs, (stage, i) => _.each(stage, (rule, j) => {
                                content.push(`\n${ i + 1 }\t${ j + 1 }\t${rule.event}\n`);
                                content.push((rule.conditions.length > 0) ? '\t\tConditions:\n' : '\t\tConditions:\n\t\t\tAlways\n');

                                _.each(rule.conditions, (condition) => compare(condition, 3));

                                if (rule.correct.length > 0) {
                                    content.push('\t\tIf conditions met:\n');

                                    _.each(rule.correct, (correct) => {
                                        _.each(correct.targets, (target) => {
                                            content.push(`\t\t\tAfter ${ correct.delay } ms\t${ correct.action }\t${ target.type || target }\n`);
                                            if (_.isObject(target)) properties(_.omit(target, 'type'), 6);
                                        });
                                        _.each(correct.specifications, (value, key) => content.push(`\t\t\t\t\t${ key }\t${ value }\n`));
                                    });
                                }
                                
                                if (rule.incorrect.length > 0) {
                                    content.push('\t\tIf conditions not met:\n');

                                    _.each(rule.incorrect, (incorrect) => _.each(incorrect.targets, (target) => {
                                        content.push(`\t\t\tAfter ${ incorrect.delay } ms\t${ incorrect.action }\t${ target.type || target }\n`);
                                    }));
                                }
                            }));

                            break;
                        }
                        case 'shaping1':
                            headers = [ 'Trial No', 'Trial Start', 'Tone Start', 'Reward Stop', 'IR Entry (Post-Tone)' ];
                            events = [ [ 'trial.start', 'audio.start', 'reward', 'request.ir.0' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id);

                                if (n === 0) addOrigin(trial, headers);

                                content.push(`${ trial.number }\t`);

                                _.each(trial.data, (stage, i) => {
                                    const groups = getGroups(stage, i),
                                        ir = getIR(groups);
                                        
                                    _.each(events[ i ], (g) => {
                                        if (g !== 'request.ir.0' && groups[ g ]) {
                                            _.each(groups[ g ], (e) => {
                                                if (g !== 'reward' || e.request.reward === 'off') content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`); });
                                        } else if (ir) {
                                            _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                        } else {
                                            content.push('\t');
                                        }
                                    });
                                });

                                content.push('\n');
                            });

                            break;
                        case 'shaping2':
                            headers = [ 'Trial No', 'Trial Start', 'Initial Poke', 'IR Entry' ];
                            events = [ [ 'cross.start', 'click', 'request.ir.0' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                const trial = Trials.findOne(id),
                                    clicks = _.filter(trial.data[ 0 ], (e) => (e.type === 'click'));

                                if (n === 0) addOrigin(trial, headers);

                                content.push(`${ trial.number }\t`);

                                _.each(trial.data, (stage, i) => {
                                    const groups = getGroups(stage, i),
                                        ir = getIR(groups);

                                    _.each(groups[ 'trial.start' ], (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));

                                    if (clicks.length > 0) content.push(`${ getTime(clicks[ 0 ].timeStamp, trial.timeOrigin) }\t`);
                                    if (ir) _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                });

                                content.push('\n');
                            });

                            break;
                        case 'shaping4':
                            axis = 'x'; // Analyze w/ horizontal mask parameters
                            headers = [ 'Trial No', 'Trial Type', 'Outcome', 'Trial Start', 'Stimulus Start', 'Response',
                                 'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry' ];
                            events = [ [ 'trial.start' ], [ 'stimuli.start', 'click' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                let correct = {};
                                const trial = Trials.findOne(id),
                                    data2 = trial.data[ 1 ];

                                if (n === 0) addOrigin(trial, headers);

                                if (data2 && data2.length > 0) {
                                    const clicks = _.filter(data2, (e) => (e.type === 'click' && !isCross(e, region, axis))),
                                        cross = _.filter(data2, (e) => (e.type === 'click' && isCross(e, region, axis)));

                                    content.push(`${ trial.number }\t`);
                                    correct = addCorrect(clicks, region, trial.stages[ 1 ][ 0 ], axis);

                                    _.each(trial.data, (stage, i) => {
                                        const groups = getGroups(stage, i),
                                            ir = getIR(groups);

                                        _.each(events[ i ], (g) => {
                                            if (g !== 'click') content.push((groups[ g ])
                                                ? `${ getTime(groups[ g ][ 0 ].timeStamp, trial.timeOrigin) }\t` : '\t'); });

                                        if (_.contains(events[ i ], 'click')) addClicks(correct, cross, trial.timeOrigin);                                
                                        if (ir) _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                    });

                                    content.push('\n');
                                }
                            });

                            break;
                        case 'shaping6':
                            axis = 'x'; // Analyze w/ horizontal mask parameters
                            headers = [ 'Trial No', 'Trial Type', 'Outcome', 'Stage Start', 'Stimulus Start', 'Response',
                                'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry' ];
                            events = [ [ 'cross.start' ], [ 'stimuli.start', 'click' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                let correct = {};
                                const trial = Trials.findOne(id),
                                    data2 = trial.data[ 1 ];

                                if (n === 0) addOrigin(trial, headers);

                                if (data2 && data2.length > 0) {
                                    const clicks = _.filter(data2, (e) => (e.type === 'click' && !isCross(e, region, axis))),
                                        cross = _.filter(data2, (e) => (e.type === 'click' && isCross(e, region, axis)));

                                    content.push(`${ trial.number }\t`);
                                    correct = addCorrect(clicks, region, trial.stages[ 1 ][ 0 ], axis);
                                    _.each(trial.data, (stage, i) => {
                                        const groups = getGroups(stage, i),
                                            ir = getIR(groups, 'shaping4');

                                        _.each(events[ i ], (g) => {
                                            if (g !== 'click') content.push((groups[ g ])
                                                ? `${ getTime(groups[ g ][ 0 ].timeStamp, trial.timeOrigin) }\t` : '\t'); });

                                        if (_.contains(events[ i ], 'click')) addClicks(correct, cross, trial.timeOrigin);                                
                                        if (ir) _.each(ir, (e)=> (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                    });

                                    content.push('\n');
                                }
                            });

                            break;
                        case 'shaping4v':
                        case 'shaping6v':
                            axis = 'y'; // Analyze w/ vertical mask parameters
                            headers = [ 'Trial No', 'Bias', 'Trial Type', 'Outcome', 'Trial Start', 'Stimulus Start', 'Response',
                                'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry' ];
                            events = [ [ 'trial.start' ], [ 'stimuli.start', 'click' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                let correct = {};
                                const trial = Trials.findOne(id),
                                    data2 = trial.data[ 1 ];

                                if (n === 0) addOrigin(trial, headers);

                                if (data2 && data2.length > 0) {
                                    const clicks = _.filter(data2, (e) => (e.type === 'click' && !isCross(e, region, axis))),
                                        cross = _.filter(data2, (e) => (e.type === 'click' && isCross(e, region, axis)));

                                    content.push(`${ trial.number }\t`);
                                    content.push(`${ trial.bias }\t`);
                                    correct = addCorrect(clicks, region, trial.stages[ 1 ][ 0 ], axis, trial.bias);

                                    _.each(trial.data, (stage, i) => {
                                        const groups = getGroups(stage, i),
                                            ir = getIR(groups, 'shaping4');

                                        _.each(events[ i ], (g) => {
                                            if (g !== 'click') content.push((groups[ g ]) ? `${ getTime(groups[ g ][ 0 ].timeStamp, trial.timeOrigin) }\t` : '\t'); });

                                        if (_.contains(events[ i ], 'click')) addClicks(correct, cross, trial.timeOrigin);                                
                                        if (ir) _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                    });

                                    content.push('\n');
                                }
                            });

                            break;
                        case 'shaping8v':
                            axis = 'y'; // Analyze w/ vertical mask parameters
                            headers = [ 'Trial No', 'Target Contrast', 'Target Orientation', 'Outcome', 'Flanker Contrast', 'Flanker Orientation',
                                'Flanker Position', 'Stage Start', 'Stimulus Start', 'Response', 'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry' ];
                            events = [ [ 'cross.start' ], [ 'stimuli.start', 'click' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                let correct = {};
                                const trial = Trials.findOne(id),
                                    data2 = trial.data[ 1 ];

                                if (n === 0) addOrigin(trial, headers);

                                if (data2 && data2.length > 0) {
                                    const clicks = _.filter(data2, (e) => (e.type === 'click' && !isCross(e, region, axis))),
                                        cross = _.filter(data2, (e) => (e.type === 'click' && isCross(e, region, axis))),
                                        target = _.find(trial.stages[ 1 ], (e) => (e.number === 1)),
                                        flanker = _.find(trial.stages[ 1 ], (e) => (e.number === 2)),
                                        grid = _.get(flanker, [ 'grid', 'x' ], '-'),
                                        pos = _.get(flanker, [ 'location', 'x' ], '-'),
                                        orientation = _.get(flanker, [ 'orientation', 'value' ], '-');

                                    content.push(`${ trial.number }\t`);
                                    content.push(`${ _.get(target, 'contrast', '-') }\t`);
                                    correct = addCorrect(clicks, region, target, axis);
                                    content.push(`${ _.get(flanker, 'contrast', '-') }\t`);
                                    content.push(`${ (orientation !== '-') ? (orientation > 0 ? 'H' : 'V') : '-' }\t`);
                                    content.push(`${ (pos !== '-' && grid !== '-') ? (pos < Math.round(grid / 2) ? 'L' : 'R') : '-' }\t`);

                                    _.each(trial.data, (stage, i) => {
                                        const groups = getGroups(stage, i),
                                            ir = getIR(groups, 'shaping4');

                                        _.each(events[ i ], (g) => {
                                            if (g !== 'click') content.push((groups[ g ])
                                                ? `${ getTime(groups[ g ][ 0 ].timeStamp, trial.timeOrigin) }\t` : '\t'); });

                                        if (_.contains(events[ i ], 'click')) addClicks(correct, cross, trial.timeOrigin);                                
                                        if (ir) _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                    });

                                    content.push('\n');
                                }
                            });

                            break;
                        case 'optogenetics': // Update 6v for addition of optogenetics command
                            axis = 'y'; // Analyze w/ vertical mask parameters
                            headers = [ 'Trial No', 'Trial Type', 'Outcome', 'Trial Start', 'Stage Start', 'Stimulus Start', 'Response',
                                'Incorrect Response(s)', 'Cross Poke(s)', 'Stimulation', 'Rising Edge', 'IR Entry' ];
                            events = [ [ 'trial.start', 'cross.start' ], [ 'stimuli.start', 'click' ] ];
                            content = defaultContent(session);

                            _.each(session.trials, (id, n) => {
                                let correct = {};
                                const trial = Trials.findOne(id),
                                    data2 = trial.data[ 1 ];

                                if (n === 0) addOrigin(trial, headers);

                                if (data2 && data2.length > 0) {
                                    const clicks = _.filter(data2, (e) => (e.type === 'click' && !isCross(e, region, axis))),
                                        cross = _.filter(data2, (e) => (e.type === 'click' && isCross(e, region, axis)));

                                    content.push(`${ trial.number }\t`);
                                    correct = addCorrect(clicks, region, trial.stages[ 1 ][ 1 ], axis);

                                    _.each(trial.data, (stage, i) => {
                                        const groups = getGroups(stage, i),
                                            ir = getIR(groups, 'shaping4');

                                        _.each(events[ i ], (g) => {
                                            if (g !== 'click') content.push((groups[ g ])
                                                ? `${ getTime(groups[ g ][ 0 ].timeStamp, trial.timeOrigin) }\t`
                                                : '\t'); });

                                        if (_.contains(events[ i ], 'click')) {
                                            addClicks(correct, cross, trial.timeOrigin);

                                            // TTL signal sent to optogenetics DAQ
                                            const command = _.get(trial.stages, [ 1, 0, 'commands', 0 ]) || {},
                                                ttl = _.find(data2, (e) => (e.type === 'board' && e.request.state === 1));

                                            content.push(_.isEmpty(command) ? 'OFF\t' : 'ON\t');

                                            if (ttl) {
                                                epoch = ttl.timeStamp - ttl.request.timeStamp; // Fix timeStamp
                                                content.push(`${ getTime(epoch, trial.timeOrigin, false) }\t`);
                                            } else {
                                                content.push('\t\t');
                                            }
                                        }

                                        if (ir) _.each(ir, (e) => (content.push(`${ getTime(e.timeStamp, trial.timeOrigin) }\t`)));
                                    });

                                    content.push('\n');
                                }
                            });

                            break;
                    }

                    saveAs(new Blob(content, { type:'data:application/vnd.ms-excel;base64' }), filename);
            };

        if (template.data.date) {
            print(template.data);
        } else {
            const table = template.parent().$('table').DataTable(),
                selected = table.rows('.active').data(),
                ids = _.pluck(selected, '_id');

            _.each(ids, (id) => Meteor.subscribe('sessions.single', id, { onReady: () => {
                Meteor.subscribe('trials.session', id, { onReady: () => {
                    const session = Sessions.findOne(id);
                    print(session);
                }});
            }}));
        }
    }
});

Template.dataMenu.helpers({
    dataTemplate() {
        return Template.instance().parent(2).dataTemplate;
    },
    format() {
        return Template.instance().parent(2).format.get();
    },
    selected() {
        return Template.instance().parent(2).selected.get();
    }
});

Template.deviceCell.helpers({
    box(id) {
        return Meteor.users.findOne(id);
    }
});

Template.precisionTimeCheckbox.helpers({
    precision() {
        return Template.instance().parent(3).precision.get();
    }
});

Template.precisionTimeCheckbox.onRendered(function () {
    const template = this.parent(3),
        precision = template.precision.get();

    this.$('#precision')
        .checkbox({
            onChecked () { template.precision.set(true); },
            onUnchecked () { template.precision.set(false); }
        })
        .checkbox((precision) ? 'check' : 'uncheck');
});

Template.sessionsView.events({
    'click tbody > tr'(_event, template) {
        // const prev = template.parent().session.get(),
        const table = template.$('table').DataTable(),
            // session = table.row(event.currentTarget).data(),
            selected = table.rows('.active').data(),
            ids = _.pluck(selected, '_id');

        template.parent().selected.set(ids);
        //if (prev !== session._id) template.parent().session.set(session._id); // Enables Trials view
    }
});

Template.sessionsView.helpers({
    filters() {
        const experiment = Template.currentData();
        return { "experiment": experiment._id };
    }
});

Template.sessionsView.onCreated(function () {
    this.subscribe('subjects.experiment', this.data._id);
    this.subscribe('users', { $or: [ { _id: { $in: this.data.users } }, { 'profile.device': { $ne: false } } ] });
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

        return (text[ key ]) ? text[ key ] : key;
    }
});

Template.settingsList.onRendered(() => {
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
        return Subjects.find({ _id: { $in: subjects } });
    },
});

Template.trialList.helpers({
    delay(index, event) {
        const events = Template.parentData(1);

        if (index > 0) {
            const previous = events[ index - 1 ],
                delay = (event.timeStamp || event.context.time) - (previous.timeStamp || previous.context.time);

            return delay.toFixed(3);
        }
    },
    event(request) {
        return _.map(_.pairs(request), (property) => ({
            key: property[ 0 ],
            value: (parseFloat(property[ 1 ])) ? parseFloat(property[ 1 ]).toFixed(3) : property[ 1 ]
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
                            re: {
                                start: {
                                    main: 'violet volume up'
                                },
                                stop: {
                                    main: 'violet volume off'
                                }
                            },
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
                    cross: {
                        end: {
                            corner: 'dont',
                            main: 'plus'
                        },
                        start: {
                            corner: 'play',
                            main: 'plus'
                        }
                    },
                    ir: {
                        entry: {
                            main: 'orange sign in'
                        },
                        exit: {
                            main: 'orange sign out'
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
                    ? type.split(/(?:[.\d])+/ig)
                    : _.filter(_.flatten(_.pairs(request)), _.isString),
                path = _.property(_.filter(properties, (string) => !parseInt(string)));

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
        return Trials.find({ _id: { $in: ids } });
    }
});

Template.trialList.onCreated(function () {
    const stages = _.flatten(_.unique(this.data.settings.stages, (trial) => JSON.stringify(trial)), true);

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
                    groups = _.map(trial.data, (stage) => _.groupBy(stage, (element) =>
                        (element.type) ? element.type.split('.')[0] : element.sender)),
                    session = _.flatten([ groups[ s ].session, groups[ s ].trial ]),
                    time = _.groupBy(_.compact(session), (e) => _.last(e.type.split('.'))),
                    types = _.map(stages, (stage, i) => _.map(stage, (e) =>
                        (groups[ i ]) ? (groups[ i ][ e.type || e.sender ] || []) : [])),
                    cells = _.flatten([ [ time.start ], ...types, [ time.end || time .abort ] ], true);

                /** Distribute events by timestamp rather than event: */
                const events = _.flatten(trial.data),
                    es = _.omit(groups[ s ], _.pluck(stages[ s ], 'type' || 'sender'), [ 'session', 'trial' ]);

                if (es.click) counts.clicks += es.click.length;

                let n = 0,
                    firstEntry = 0,
                    lastTone = 0;

                _.each(cells, (cell) => {
                    let event = events[ n ];

                    _.each(cell, (step, j, list) => {
                        if (event.type === 'click' && event.timeStamp <= step.timeStamp) {
                            list.splice(j, 0, event);
                        } else if (step.type.startsWith('audio')) {
                            if (!lastTone) {
                                if (step.type.endsWith('start')) {
                                    counts.tones.push(step.timeStamp);
                                    lastTone = step.timeStamp;
                                }
                            }
                        } else if (step.type === 'reward') {
                            if (_.has(step.request, 'ir')) {
                                if (!firstEntry) {
                                    if (step.request.ir === 'entry') {
                                        counts.ir.entries.push(step.timeStamp);
                                        firstEntry = step.timeStamp;
                                    } else {
                                        counts.ir.exits.push(step.timeStamp);
                                    }
                                }
                            } else if (_.has(step.request, 'dispense')) {
                                counts.amount += step.request.amount;
                                counts.dispensed += step.request.dispense;
                            }
                        }

                        event = events[ n++ ];
                    });
                });

                if (firstEntry && lastTone && firstEntry - lastTone > 0) counts.ir.delays.push(firstEntry - lastTone);
                list.push(cells);
            }
        });

        return { counts: counts, list: list, stages: stages };
    };

    this.table = new ReactiveVar();

    this.autorun(() => {
        const trials = Trials.find({ _id: { $in: this.data.trials } }).fetch(),
            table = this.analyzeTrials(stages, trials);

        this.parent(2).counts.set(table.counts);
        this.table.set(table);
    });
});

Template.trialList.onRendered(() => {
    Template.instance().$('table').tablesort().data('tablesort').sort($("th.sorted:first-child"));
});

Template.trialsView.onCreated(function () {
    this.subscribe('sessions.single', this.data._id);
    this.subscribe('subjects.session', this.data.subjects);
    this.subscribe('trials.session', this.data._id);
    this.subscribe('users', { $or: [ { _id: this.data.user }, { _id: this.data.device } ] });
});
