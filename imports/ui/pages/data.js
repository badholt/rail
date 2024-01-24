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
		const print = (date, device, experiment, filename, getGroups, session, settings, subjects, user) => {
			let headers, events, content;
			switch (settings) {
				case 'indices':
					headers = ['Trial No', 'Trial Index'],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n'							
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);

						if (trial.number === 1) {
							content.push('Time Origin\t' + trial.timeOrigin + '\n\n');
							content.push(headers.join('\t') + '\n');
						}
						
						content.push(trial.number + '\t');
						content.push(trial.index + '\t\n');
					});

					break;
				case 'responses':
					headers = ['Trial No'],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n'
						];
					const height = 600, width = 800;

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id),
							clicks = _.map(trial.data, (stage, i) => {
								return _.filter(stage, (e) => (e.type === 'click'));
							});

						if (trial.number === 1) {
							content.push('Time Origin\t' + trial.timeOrigin + '\n\n');
							content.push(headers.join('\t') + '\n');
						}
						
						content.push(trial.number + '\t');
						
						_.each(clicks, (stage, i) => _.each(stage, (e, j) => {
							content.push(((e.clientY > 420) ? 'm\t' : (e.clientX < (width / 2)) ? 'l\t' : 'r\t') + e.timeStamp + '\t');
						}));
						
						content.push('\n');
					});

					break;
				case 'reward':
					headers = ['Trial No', 'Dispense Time', 'Amount Dispensed', 'TimeStamp'],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);
						let amount = 0,
							dispense = 0,
							timeStamps = [];

						_.each(trial.data, (stage, i) => {
							const groups = getGroups(stage, i);

							if (groups['reward']) _.each(groups['reward'], (e) => {
								if (e.request.dispense) {
									amount += ((e.request.dispense - device.profile.calibration.water.intercept) / device.profile.calibration.water.slope);
									dispense += e.request.dispense;

									if (e.timeStamp) timeStamps.push(e.timeStamp);
								}
							});
						});

						content.push(trial.number + '\t');
						content.push(dispense + '\t');
						content.push(amount + '\t');
						_.each(timeStamps, (timeStamp, i) => (content.push(timeStamp + '\t')));
						content.push('\n');
					});

					break;
				case 'sensor':
					headers = ['Trial No', 'Sensor Status', 'TimeStamp'],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);

						_.each(trial.data, (stage, i) => {
							const groups = getGroups(stage, i);console.log(groups),
							ir = _.sortBy(_.flatten(_.filter(groups, (value, key) => (key.startsWith('request.ir.')))), (e) => (e.timeStamp));
						});

						content.push(trial.number + '\t');
						_.each(ir, (e) => (content.push(e.status + '\t' + e.timeStamp + '\t')));
						content.push('\n');
					});

					break;
				case 'settings':
					headers = ['Stage', 'Rule', 'Event'],
					content = [
						'Experiment\t' + experiment.title + '\n',
						'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
						'Subject\t' + subjects + '\n',
						'Device\t' + device.profile.name + '\n',
						'Experimenter\t' + user.profile.name + '\n\n'
					];

					content.push('Session\n');

					_.each(session.settings.session, (value, key) => {
						content.push(key + '\t' + value + '\n');
					});

					const compare = (condition, indent) => {
						_.each(condition.objects, (object, o) => {
							_.times(indent, () => content.push('\t'));
							content.push(object.name);

							if (_.isObject(object.property)) {
								content.push('\n');

								_.each(object.property, (value, key) => {
									if (key !== 'conditions') {
										_.times(indent + 1, () => content.push('\t'));
										content.push(key + '\t' + value + '\n');
									} else {
										_.each(object.property.conditions, (c) => compare(c, indent + 1));
										content.push('\n');
									}
								});
							} else {
								content.push('\t' + object.property + '\n');
							}
						});

						_.times(indent, () => content.push('\t'));
						content.push(condition.comparison + '\n');

						_.each(condition.subjects, (subject, s) => {
							_.times(indent, () => content.push('\t'));
							content.push(subject.name);

							if (_.isObject(subject.property)) {
								content.push('\n');
								
								_.each(subject.property, (value, key) => {
									if (key !== 'conditions') {
										_.times(indent + 1, () => content.push('\t'));
										content.push(key + '\t' + value + '\n');
									} else {
										_.each(subject.property.conditions, (c) => compare(c, indent + 1));
										content.push('\n');
									}
								});
							} else {
								content.push('\t' + subject.property + '\n');
							}
						});
					},
					properties = (target, indent) => {
						if (_.isObject(target)) {
							_.each(target, (value, key) => {
								_.times(indent, () => content.push('\t'));
								content.push(key);

								if (!_.isObject(value)) {
									content.push('\t' + value + '\n');
								} else {
									content.push('\n');
									properties(value, indent + 1);
								}
							});
						} else {
							_.times(indent, () => content.push('\t'));
							content.push(target + '\n');
						}
					};

					content.push('\n' + headers.join('\t'));

					_.each(session.settings.inputs, (stage, i) => _.each(stage, (rule, j) => {
						content.push('\n' + (i + 1) + '\t' + (j + 1) + '\t' + rule.event + '\n');
						content.push((rule.conditions.length > 0) ? '\t\tConditions:\n' : '\t\tConditions:\n\t\t\tAlways\n');
						_.each(rule.conditions, (condition, k) => compare(condition, 3));

						if (rule.correct.length > 0) {
							content.push('\t\tIf conditions met:\n');
							_.each(rule.correct, (correct, k) => {
								_.each(correct.targets, (target, l) => {
									content.push('\t\t\tAfter ' + correct.delay + ' ms\t' + correct.action + '\t' + (target.type || target) + '\n');
									if (_.isObject(target)) properties(_.omit(target, 'type'), 6);
								});
								_.each(correct.specifications, (value, key) => content.push('\t\t\t\t\t' + key + '\t' + value + '\n'));
							});
						}
						
						if (rule.incorrect.length > 0) {
							content.push('\t\tIf conditions not met:\n');
							_.each(rule.incorrect, (incorrect, k) => {
								_.each(incorrect.targets, (target, l) => {
									content.push('\t\t\tAfter ' + incorrect.delay + ' ms\t' + incorrect.action + '\t' + (target.type || target) + '\n');
								});
							});
						}
					}));

					break;
				case 'shapingI':
					headers = ['Trial No', 'Trial Start', 'Tone Start', 'Reward Stop', 'IR Entry'],
						events = [['trial.start', 'audio.wave.start', 'reward.dispense.fired', 'request.ir.1']],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);

						content.push(trial.number + '\t');

						_.each(trial.data, (stage, i) => {
							const groups = getGroups(stage, i),
								ir = _.filter(groups['request.ir.1'], (e) => {
									/*if (groups['audio.wave.start']) {
										const tone = groups['audio.wave.start'][0];
										return (tone) ? (e.timeStamp - tone.timeStamp) > 0 : false;*/

									if (groups['reward.dispense.fired']) {
										const reward = groups['reward.dispense.fired'][0];
										return (reward) ? (e.timeStamp - reward.timeStamp) > 0 : false;
									} else {
										console.log('no reward: ', stage, i, groups['reward.dispense.fired']);
									}
								});
								
								_.each(events[i], (g) => {
									if (g !== 'request.ir.1' && groups[g]) {
										_.each(groups[g], (e)=> {
											content.push(e.timeStamp + '\t');
										});
									} else if (ir) {
										_.each(ir, (e)=> {
											content.push(e.timeStamp + '\t');
										});
									} else {
										content.push('\t');
									}
								});
						});

						content.push('\n');
					});

					break;
				case 'shapingII':
					headers = ['Trial No', 'Trial Start', 'Initial Poke', 'IR Entry'],
						events = [['cross.start', 'click', 'request.ir.1']],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id),
							clicks = _.filter(trial.data[0], (e) => (e.type === 'click'));

						if (clicks.length > 0) {
							_.each(trial.data, (stage, i) => {
								const groups = getGroups(stage, i),
									ir = _.filter(groups['request.ir.1'], (e) => {
										if (groups['audio.wave.start']) {
											const tone = groups['audio.wave.start'][0];
											return (tone) ? (e.timeStamp - tone.timeStamp) > 0 : false;
										} else {
											console.log('no tone: ', stage, i, groups['audio.wave.start']);
										}
									});

								if (i === 0) content.push(trial.number + '\t');

								_.each(events[i], (g) => {
									if (g !== 'request.ir.1' && groups[g]) {
										_.each(groups[g], (e)=> {
											content.push(e.timeStamp + '\t');
										});
									} else if (ir) {
										_.each(ir, (e)=> {console.log(e);
											content.push(e.timeStamp + '\t');
										});
									} else {
										content.push('\t');
									}
								});
							});

							content.push('\n');
						}
					});

					break;
				case 'shapingIV':
					headers = ['Trial No', 'Trial Type', 'Outcome', 'Stage Start', 'Stimulus Start', 'Response',
						 'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry'],
						events = [['cross.start'], ['stimuli.start', 'click']],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);

						let correct = {};

						if (trial.data[1] && trial.data[1].length > 0) {
							const clicks = _.filter(trial.data[1], (e) => (e.type === 'click' && e.clientY < 420)),
							cross = _.filter(trial.data[1], (e) => (e.type === 'click' && e.clientY > 420)),
							width = 800; //TODO: Make part of device profile, or get screenwidth from click using OffsetX, PageX, or similar

							content.push(trial.number + '\t');

							if (trial.stages[1][0] && trial.stages[1][0].orientation.value === 0) {
								content.push('V\t');
								if (clicks.length > 0) correct = _.groupBy(clicks, (c) => (c.clientX < (width / 2)));
							} else {
								content.push('H\t');
								if (clicks.length > 0) correct = _.groupBy(clicks, (c) => (c.clientX > (width / 2)));
							}

							if (clicks.length > 0) {
								content.push((correct.hasOwnProperty('true')) ? '0\t' : '1\t');
							} else {
								content.push('2\t');
							}

							_.each(trial.data, (stage, i) => {
								const groups = getGroups(stage, i),
									ir = _.filter(groups['request.ir.1'], (e) => {
										const on = _.find(groups['reward'], (r) => (r.request.reward === "on"));
										return (on) ? (e.timeStamp - on.timeStamp) > 150 : false;
									});

								_.each(events[i], (g) => {
									if (g !== 'click') {
										content.push((groups[g]) ? (groups[g][0].timeStamp) + '\t' : '\t');
									}
								});

								if (_.contains(events[i], 'click')) {
									const c = correct['true'],
										f = correct['false'];

									content.push((c) ? c[0].timeStamp + '\t' : (f) ? f[0].timeStamp + '\t' : '\t');
									content.push((f) ? f.length + '\t' : 0 + '\t');
									content.push((cross) ? cross.length + '\t' : 0 + '\t');
								}
								
								if (ir) {
									_.each(ir, (e)=> {
										content.push(e.timeStamp + '\t');
									});
								}
							});

							content.push('\n');
						}
					});

					break;
				case 'shapingVI':
					headers = ['Trial No', 'Trial Type', 'Outcome', 'Stage Start', 'Stimulus Start', 'Response',
						 'Incorrect Response(s)', 'Cross Poke(s)', 'IR Entry'],
						events = [['cross.start'], ['stimuli.start', 'click']],
						content = [
							'Experiment\t' + experiment.title + '\n',
							'Date\t' + date.format('dddd, MMMM Do HH:mm') + '\n',
							'Subject\t' + subjects + '\n',
							'Device\t' + device.profile.name + '\n',
							'Experimenter\t' + user.profile.name + '\n\n\n',
							headers.join('\t') + '\n'
						];

					_.each(session.trials, (id) => {
						const trial = Trials.findOne(id);console.log(session, id, trial);

						let correct = {};

						if (trial.data[1] && trial.data[1].length > 0) {
							const clicks = _.filter(trial.data[1], (e) => (e.type === 'click' && e.clientY < 420)),
							cross = _.filter(trial.data[1], (e) => (e.type === 'click' && e.clientY > 420)),
							width = 800; //TODO: Make part of device profile, or get screenwidth from click using OffsetX, PageX, or similar

							content.push(trial.number + '\t');

							if (trial.stages[1][0] && trial.stages[1][0].orientation.value === 0) {
								content.push('V\t');
								if (clicks.length > 0) correct = _.groupBy(clicks, (c, i) => (i < 1 && c.clientX < (width / 2)));
							} else {
								content.push('H\t');
								if (clicks.length > 0) correct = _.groupBy(clicks, (c, i) => (i < 1 && c.clientX > (width / 2)));
							}

							if (clicks.length > 0) {console.log(correct);
								content.push((correct.hasOwnProperty('true')) ? '0\t' : '1\t');
							} else {
								content.push('2\t');
							}

							_.each(trial.data, (stage, i) => {
								const groups = getGroups(stage, i),
									ir = _.filter(groups['request.ir.1'], (e) => {
										const on = _.find(groups['reward'], (r) => (r.request.reward === "on"));
										return (on) ? (e.timeStamp - on.timeStamp) > 150 : false;
									});

								_.each(events[i], (g) => {
									if (g !== 'click') {
										content.push((groups[g]) ? (groups[g][0].timeStamp) + '\t' : '\t');
									}
								});

								if (_.contains(events[i], 'click')) {
									const c = correct['true'],
										f = correct['false'];

									content.push((c) ? c[0].timeStamp + '\t' : (f) ? f[0].timeStamp + '\t' : '\t');
									content.push((f) ? f.length + '\t' : 0 + '\t');
									content.push((cross) ? cross.length + '\t' : 0 + '\t');
								}
								
								if (ir) {
									_.each(ir, (e)=> {
										content.push(e.timeStamp + '\t');
									});
								}
							});

							content.push('\n');
						}
					});

					break;
			}

			saveAs(new Blob(content), filename);
		};
		
		if (template.data.date) {
            const date = moment(template.data.date),
			experiment = Experiments.findOne(template.data.experiment),
			device = Meteor.users.findOne(template.data.device),
			getGroups = (stage, i) => {
				const p = ['request', 'ir'];

				return _.groupBy(stage, (e) => ((_.property(p)(e) !== undefined)
					? p.join('.') + '.' + _.property(p)(e)
					: e.type.replace(/(\.?(re)?[\d]+\.)+/ig, '.')));
			},
			settings = template.$('#templates').dropdown('get value'),
			subjects = _.map(template.data.subjects, (id) => {
				const subject = Subjects.findOne(id);
				if (subject) return subject.identifier;
			}).toString(),
			user = Meteor.users.findOne(template.data.user),
			filename = subjects + '[' + date.format('YY.MM.DD.HH.mm') + '].xls';
			
			print(date, device, experiment, filename, getGroups, template.data, settings, subjects, user);
		} else {
			const table = template.parent().$('table').DataTable(),
			selected = table.rows('.active').data(),
			ids = _.pluck(selected, '_id');

			_.each(ids, (id)=> {
				Meteor.subscribe('sessions.single', id, {
					onReady: function () {
						Meteor.subscribe('trials.session', id, {
							onReady: function () {
								const session = Sessions.findOne(id),
								date = moment(session.date),
								device = Meteor.users.findOne(session.device),
								getGroups = (stage, i) => {
									const p = ['request', 'ir'];

									return _.groupBy(stage, (e) => ((_.property(p)(e) !== undefined)
										? p.join('.') + '.' + _.property(p)(e)
										: e.type.replace(/(\.?(re)?[\d]+\.)+/ig, '.')));
								},
								settings = template.$('#templates').dropdown('get value'),
								subjects = _.map(session.subjects, (id) => {
									const subject = Subjects.findOne(id);
									if (subject) return subject.identifier;
								}).toString(),
								user = Meteor.users.findOne(session.user),
								filename = subjects + '[' + date.format('YY.MM.DD.HH.mm') + '].xls';
								
								print(date, device, template.data, filename, getGroups, session, settings, subjects, user);
							}
						});
					},
				});
			});
		}
    }
});

Template.dataMenu.onRendered(function () {
    this.$('#templates').dropdown();
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
		const selected = table.rows('.active').data(),
			ids = _.pluck(selected, '_id');
console.log(selected, ids);
        //if (prev !== session._id) template.parent().session.set(session._id);
    }
});

Template.sessionsView.helpers({
    filters() {
        const experiment = Template.currentData(),
            filters = {
                subjects: {subjects: {$all: [""]}}
            };

        return {"experiment": experiment._id};
    }
});

Template.sessionsView.onCreated(function () {
    this.subscribe('subjects.experiment', this.data._id);
    this.subscribe('users', {$or: [{_id: {$in: this.data.users}}, {'profile.device': {$ne: false}}]});

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
                    groups = _.map(trial.data, (stage) => _.groupBy(stage, (element) =>
                        (element.type) ? element.type.split('.')[0] : element.sender)),
                    session = _.flatten([groups[s]['session'], groups[s]['trial']]),
                    time = _.groupBy(_.compact(session), (e) => _.last(e.type.split('.'))),
                    types = _.map(stages, (stage, i) => _.map(stage, (e) =>
                        (groups[i]) ? (groups[i][e.type || e.sender] || []) : [])),
                    cells = _.flatten([[time['start']], ...types, [time['end'] || time ['abort']]], true);

                /** Distribute events by timestamp rather than event: */
                const events = _.flatten(trial.data),
                    es = _.omit(groups[s], _.pluck(stages[s], 'type' || 'sender'), ['session', 'trial']);

                if (es.click) counts.clicks += es.click.length;

                let n = 0,
                    firstEntry = 0,
                    lastTone = 0;

                _.each(cells, (cell) => {
                    let event = events[n];

                    _.each(cell, (step, j, list) => {
                        if (event.type === 'click' && event.timeStamp <= step.timeStamp) {
                            list.splice(j, 0, event);
                        } else if (step.type.startsWith('audio')) {
                            if (!lastTone) {
                                if (step.type.endsWith('start')) {
                                    counts.tones.push(step.timeStamp);
                                    lastTone = step.timeStamp;
                                    // console.log('%caudio:\t', 'color: blue;', e, lastTone);
                                }
                                if (step.type.endsWith('stop')) {
                                    // console.log('%caudio:\t', 'color: red;', e, lastTone);
                                }
                            }
                        } else if (step.type === 'reward') {
                            if (_.has(step.request, 'ir')) {
                                if (!firstEntry) {
                                    if (step.request.ir === 'entry') {
                                        // console.log('%cIR:\t', 'color: purple;', step);
                                        counts.ir.entries.push(step.timeStamp);
                                        firstEntry = step.timeStamp;
                                    } else {
                                        // console.log('%cIR:\t', 'color: violet;', step);
                                        counts.ir.exits.push(step.timeStamp);
                                    }
                                }
                            } else if (_.has(step.request, 'dispense')) {
                                counts.amount += step.request['amount'];
                                counts.dispensed += step.request['dispense'];
                            }
                        }

                        event = events[n++];
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
    this.subscribe('subjects.session', this.data.subjects);
    this.subscribe('trials.session', this.data._id);
    this.subscribe('users', {$or: [{_id: this.data.user}, {_id: this.data.device}]});
});
