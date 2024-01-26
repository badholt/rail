import './trial.html';

import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import _ from 'underscore';
import Tone from 'tone';
import update from 'immutability-helper';

import {calculateCenter} from '../../api/client.methods';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Sessions, Trials} from '../../api/collections';
import {Template} from 'meteor/templating';

export const collectClickEvent = (e) => JSON.parse(JSON.stringify(
        _.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
        (key, value) => (value instanceof Node) ? {
            classes: value.classList,
            id: value.id,
            parent: {
                classes: value.parentNode.classList,
                id: value.parentNode.id
            }
        } : (value instanceof Window) ? 'Window' : value, ' ')),
    conditionsMet = (input, variables) => _.every(input.conditions, (condition) =>
        _.every(condition.objects, (object) => {
            const o = variables[object.name](object.property);

            return _.every(condition.subjects, (subject) => {
                const s = variables[subject.name](subject.property);
                return variables[condition.comparison](o, s);
            });
        })),
    processEvent = (event, template, stage, trial) => {
        const session = template.session.get(),
            variables = {
                'center': (p) => (template.center[p]),
                'count': (p) => {
                    const data = template.getTrial(trial + 1).data,
					f = _.filter(data[stage - 1], (e) => {
                        const u = update(variables, {event: {$set: (p) => (e[p])}}); // Count can filter other events like iti.end, but requires all events to pass
                        return conditionsMet(p, u);
                    });console.log("COUNT", p, f);

					return f.length;
                }, // need to keep track of what event is referenced so that timeStamps can be compared
                'data': (p) => {
                    const data = template.getTrial(trial + 1).data,
                    f = _.pluck(_.filter(data[stage - 1], (e) => { // Data filters out individual events that pass a set of conditions
                        const u = update(variables, {event: {$set: (p) => (e[p])}});
                        return conditionsMet(p, u);
                    }), p.value);console.log("DATA", data, p, p.value, f, f[p.index]);

                    return f[p.index];
                },
                'event': (p) => (event[p]),
                'insert': (d, s, t) => {
                    const responses = template.responses.get();
                    if (!_.has(responses, t)) responses.push(t); // May conflict w/later experiment types
                    template.responses.set(responses);
                },
                'number': (n) => (parseFloat(n)),
                'stage': (d, i) => template.nextStage(d, i),
                'stimuli': (p) => {
                    let index = template.getTrial(trial + 1).index,
                        elements = _.filter(session.settings.stages[index][stage - 1],
                            (element) => (element.type === 'stimuli'));

                    _.each(p.split('.'), (value) => {
                        if (elements) elements = elements[value];
                    });

                    return elements;
                },
                'string': (s) => (s.toString()),
                'style': (d, s, t) => (template.timers[trial + 1][stage - 1][t + '.style'] = Meteor.setTimeout(() => ($(t).css(s.css)), d) && template.recordEvent({timeStamp: performance.now(), type: t + '.style', css: s.css})),
                'toggle': (d, s, t) => (template.toggles[t] = s.set),
                'trial': (d, i, n) => template.nextTrial(d, i, n),
                '<': (o, s) => (o < s),
                '+': (d, s, t) => variables[t](d, s.amount, s.duplicate),
                '=': (o, s) => (o === s)
            };

        _.each(session.settings.inputs[stage - 1], (input) => {
            if (input.event === event.type) {
                const correct = conditionsMet(input, variables);console.log("CORRECT", correct, input, event);
                _.each((correct) ? input.correct : input.incorrect, (action) =>
                    _.each(action.targets, (target) =>
                        variables[action.action](action.delay, action.specifications, target)));
            }
        });

        template.recordEvent(event);
    },
    sessionTimers = (settings, template, device) => {
        console.log('%c Session renders:\t' + performance.now() + ' ', 'background: brown; color: white;');
        /** Sets Session-level timers: */
        if (settings) {
            console.log('%c ...running Session... \t' + performance.now() + ' ', 'background: brown; color: white;');
            /** Delays onset of first trial: */
            Meteor.setTimeout(() => {//console.log('delay timeout:\t', performance.now(), settings.session.delay);
                console.log('%c| Session start:\t' + performance.now() + ' |', 'background: brown; color: white; font-size: 1.5em;');
                template.trial.set(0);
                template.recordEvent({timeStamp: performance.now(), type: 'session.start'});
                
            }, settings.session.delay);//console.log('set delay:\t', performance.now(), settings.session.delay);

            /** Sets timer for session duration: */
            if (settings.session.duration) {//console.log('set session:\t', performance.now(), settings.session.delay + settings.session.duration);
                Meteor.setTimeout(() => {//console.log('session timeout:\t', performance.now(), settings.session.delay + settings.session.duration);
                    const trial = template.trial.get();

                    template.recordEvent({timeStamp: performance.now(), type: 'trial.' + trial + '.end'});
                    template.recordEvent({timeStamp: performance.now(), type: 'session.end'});
                    template.clearTimers(template.timers, trial + 1);
                    //TODO: Either port session.device ID to turn off IR beam or consolidate FlowRouter reroute in nextTrial
					Meteor.call('mqttSend', device, 'lights', {command: 'off', pins: [4]});
                    Meteor.call('mqttSend', device, 'sensor', {command: 'detect', detect: 'off'}, () => {
						Meteor.call('mqttSend', device, 'client', {command: 'disconnect'});
					});
                    FlowRouter.go('/');
                }, settings.session.delay + settings.session.duration);
            }
        }
    },
    trialTimers = (settings, n, template) => {
        /** Sets Trial-level timers: */
        if (settings) {
            const pre = 'trial.' + n;

            if (template.timers[n] && !template.timers[n][pre + '.iti']) {
                /** Sets timer for maximum trial duration: */
                template.timers[n][pre + '.iti'] = Meteor.setTimeout(() => {
                    //console.log('%c ' + pre + ' ITI end\t' + performance.now() + ' ', 'background: darkblue; color: white;');
                    return processEvent({timeStamp: performance.now(), type: 'iti.end'}, template, template.stage.get(), n - 1);
                }, settings.session.iti);
                //console.log('%c ' + pre + ' ITI start\t' + performance.now() + ' ', 'background: blue; color: white;');

                /** Records trial start: */
                template.recordEvent({timeStamp: performance.now(), type: pre + '.start'});
            }
        }
    };

Template.trial.helpers({
    abort() {
        const user = Meteor.user();
		
        if (user && user.status && user.status.active.session === '') {
			const template = Template.instance(),
			session = template.session.get();

			Meteor.call('mqttSend', session.device, 'lights', {command: 'off', pins: [4]});
			Meteor.call('mqttSend', session.device, 'sensor', {command: 'detect', detect: 'off'});
			Meteor.call('mqttSend', session.device, 'client', {command: 'disconnect'});
            template.recordEvent({timeStamp: performance.now(), type: 'session.abort'});
            FlowRouter.go('/');
        }
    },
    data(settings, stage, trials) {
        if (settings) {
            const template = Template.instance(),
                i = template.trial.get(),
                n = i + 1;

            if (n > 0) {
                const id = trials[i],
                    trial = Trials.findOne(id),
					topic = 'sensor/' + this._id + '/' + n + '/' + stage;

                if (trial) {
                    if (!template.timers[n]) {
                        template.timers[n] = {};
                        //console.log('%c| trial.' + n + ' start\t' + performance.now() + ' |', 'background: black; color: white; font-size: 1.5em;');
                        trialTimers(settings, n, template);

                        Meteor.call('mqttSend', this.device, 'reward', {command: 'set', context: {session: this._id, stage: stage, timeStamp: performance.now(), trial: n}},
						() => template.recordEvent({timeStamp: performance.now(), type: 'set.context'}));
						Meteor.call('mqttSend', this.device, topic, {command: 'set', context: {timeStamp: performance.now()}},
						() => template.recordEvent({timeStamp: performance.now(), type: 'set.context'}));
                    }

                    return trial;
                }
            }
        }
    },
    session() {
        const template = Template.instance(),
            session = template.session.get();

        if (session) {
            if (!template.started.get()) {template.started.set(true);
				const i = template.trial.get(),
				stage = template.stage.get(),
                n = i + 1,
				topic = 'sensor/' + session._id + '/' + n + '/' + stage;

                sessionTimers(session.settings, template, session.device);
                Meteor.call('mqttSend', session.device, 'sensor', {command: 'detect', detect: 'on', context: {timeStamp: performance.now()}});
            }
            return session;
        }
    },
    stage() {
        return Template.instance().stage.get();
    },
    trial() {
        return Template.instance().trial.get();
    }
});

Template.trial.onCreated(function () {
    this.center = calculateCenter($(window).height(), $(window).width());
    this.index = new ReactiveVar(0);
    this.responses = new ReactiveVar([]);
    this.session = new ReactiveVar();
    this.stage = new ReactiveVar(1);
    this.started = new ReactiveVar(false);
    this.timers = {};
    this.trial = new ReactiveVar(-1);
    this.toggles = {};

    this.clearTimers = (timers, type) => {
        const n = parseInt(type);

        /** Clears timers indexed both by trial or stage number, n,
         *  and by event name. */
        if (n) {
            _.each(_.range(n, n - 2, -1), (trial) => {
                if (timers[trial]) Meteor.clearTimeout(timers[trial]['trial.' + trial + '.iti']);
                return _.each(timers[trial], (stage) =>
                    _.each(stage, (timer, label) => {
                        const whitelist = 'audio' || 'lights' || 'reward';
                        if (!label.includes(whitelist)) {
                            Meteor.clearTimeout(timer);
                            //console.log('%c\t❌ CLEAR:\t' + label + '(' + timer + ')', 'background: red; color: white;');
                        } else {
                            //console.log('%c\t✔ KEEP:\t' + label + '(' + timer + ')', 'background: green; color: white;');
                        }
                    }));
            });
        }
    };
    this.getSession = () => FlowRouter.getParam('session');
    this.getTrial = (number) => Trials.findOne({number: number, session: id});
    this.nextStage = (delay, increment) => {
        const stage = this.stage.get() + increment,
            trial = this.trial.get() + 1,
            session = this.session.get(),
            length = session.settings.stages[trial].length;

        if (stage <= length) {
            this.clearTimers(this.timers, trial);

            if (!this.timers[trial].hasOwnProperty(stage)) this.timers[trial][stage] = {};
			
			const topic = 'sensor/' + session._id + '/' + trial + '/' + stage;
console.log('NEXT STAGE', stage);
			Meteor.call('mqttSend', session.device, 'reward', {command: 'set', context: {session: session._id, stage: stage, timeStamp: performance.now(), trial: trial}},
			() => this.recordEvent({timeStamp: performance.now(), type: 'set.context'}));
			Meteor.call('mqttSend', session.device, topic, {command: 'set', context: {timeStamp: performance.now()}},
			() => this.recordEvent({timeStamp: performance.now(), type: 'set.context'}));

            return this.timers[trial][stage]['stage.' + stage + '.start'] = Meteor.setTimeout(() => {
                this.recordEvent({timeStamp: performance.now(), type: 'stage.' + stage + '.start'});
                if (stage <= length) this.stage.set(stage);
            }, delay);
        }
    };
    this.nextTrial = (delay, increment, duplicate) => {
        const stage = this.stage.get(),
            next = this.trial.get() + increment,
            session = this.session.get();const x = this.timers;

        if (!this.timers[next]) this.timers[next] = {};
        if (!this.timers[next][stage]) this.timers[next][stage] = {};
        // TODO: Manage multiple next.trial timers (Verify always set timer / removal of if-else's else doesn't mess things up)
        // A next trial timer will now always override any previous next trial timers after clearing them
        if (this.timers[next][stage]['next.trial']) {
            const previous = this.timers[next][stage]['next.trial'];

            Meteor.clearTimeout(previous);console.log("CLEAR", previous, delay, increment, duplicate);
            this.timers[next][stage]['next.trial'] = null;
        }

        this.timers[next][stage]['next.trial'] = Meteor.setTimeout(() => {
            if (next <= session.trials.length) {
                // Meteor.call('mqttSend', session.device, 'board', {
                //     command: 'pin', pins: 23, state: 'off',
                //     context: {session: session._id, stage: stage, timeStamp: performance.now(), trial: (next - 1)}
                // }, () => this.recordEvent({timeStamp: performance.now(), type: 'microscope.end'}));

                /** Trials are indexed starting at 0, but the timers are referenced starting at Trial 1,
                 *  so clearing timers for "next" actually clears the most recent trial. */
                this.clearTimers(this.timers, next);
                // TODO: Shutdown sequence, reset state of lights, etc.
                this.recordEvent({timeStamp: performance.now(), type: 'trial.' + next + '.end'});
                //console.log('%c| trial.' + next + ' end\t' + performance.now() + ' |', 'background: darkgrey; color: white;');

                /** Proceed to next trial or exit: */
                if (session.settings.session.duration || next < session.settings.stages.length) {
                    const i = this.index.get();

                    Meteor.call('addTrial', session._id, i, next + 1, performance.timeOrigin);

                    if (!duplicate) {
                        this.index.set(i + 1);
                    } else {
                        const nt = Trials.find({index: i}).count();
                        if (nt > duplicate - 1) this.index.set(i + 1);
                    }
                    
                    this.responses.set([]);
                    this.stage.set(1);
                    this.trial.set(next);
                } else {
                    this.recordEvent({timeStamp: performance.now(), type: 'session.end'});
					Meteor.call('mqttSend', session.device, 'lights', {command: 'off', pins: [4]});
                    Meteor.call('mqttSend', session.device, 'sensor', {command: 'detect', detect: 'off'}, ()=> {
						Meteor.call('mqttSend', session.device, 'client', {command: 'disconnect'});
					});
                    console.log('%c| Session end:\t' + performance.now() + ' |', 'background: brown; color: white; font-size: 1.5em;');
                    FlowRouter.go('/');
                }
            }
        }, delay);
    };
    this.recordEvent = (event) => {
        const number = this.trial.get() + 1,
            stage = this.stage.get() - 1,
            trial = this.getTrial(number);

        if (trial) Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', event);
    };

    const id = this.getSession();
    this.sessionData = () => Sessions.findOne(id);
    this.subscribe('sessions.single', id);
    this.subscribe('trials.session', id);

    this.autorun(() => {
        const session = this.sessionData();

        if (session) {
            this.session.set(session);

            this.subscribe('experiments.single', session.experiment);
            this.subscribe('users', {_id: session.device});
        }
    });

    this.timedAudio = (audio, delay, duration, name) => {
        const stage = this.stage.get(),
            trial = this.trial.get() + 1,
            start = name + '.start',
            stop = name + '.stop';

        if (this.timers[trial][stage] && !this.timers[trial][stage][start]) {
            return Meteor.setTimeout(() => {
                this.timers[trial][stage][start] = audio.toMaster().start();
                console.log('%c🔊 ' + name + ' started\t', 'color: red; font-size: 1.5em; font-weight: 800;', performance.now());

                this.timers[trial][stage][stop] = Meteor.setTimeout(() => {
                    audio.stop();
                    this.recordEvent({timeStamp: performance.now(), type: stop});
                    console.log('%c🔊 ' + name + ' stopped\t', 'color: red; font-size: 1.5em; font-weight: 800;', performance.now());
                }, duration);

                this.recordEvent({timeStamp: performance.now(), type: start});
            }, delay);
        }
    };
    this.timedCommand = (device, topic, message, delay) => {
        const stage = this.stage.get(),
            timer = topic + '.' + message.command,
            trial = this.trial.get() + 1;

        return this.timers[trial][stage][timer] = Meteor.setTimeout(() => {
            const timeStamp = performance.now();
            //console.log('%c💬 ' + timer + '\t', 'color: orange; font-size: 1.5em; font-weight: 800;', timeStamp);
            return Meteor.call('mqttSend', device, topic, _.extend(_.omit(message, 'delay'), {
                context: {session: id, stage: stage, timeStamp: timeStamp, trial: trial}
            }), () => this.recordEvent({timeStamp: timeStamp, type: timer + '.fired'}));
        }, delay);
    };
});

Template.trialSVG.onRendered(function () {
    const session = Template.instance().parent().session.get();
    /** The Trial template should only render on device profiles.
     *  Thus, only devices should connect to MQTT and listen in on
     *  their own hardware output. */
    Meteor.call('mqttConnect', session.device);
    Meteor.call('updateTrial', session.trials[0], 'timeOrigin', 'set', performance.timeOrigin);
});

Template.trialElement.helpers({
    audio(stage, trial, i, r) {
        if (stage && trial) {
            const element = Template.currentData(),
                started = Template.instance().started.get();

            if (started !== trial) {
                Template.instance().started.set(trial);
                const name = 'audio.' + element.source.type + '.' + r + (i + 1) + '.' + trial,
                    template = Template.instance().parent(3);
                let audio;

                switch (element.source.type) {
                    case 'file':
                        audio = new Tone.Player(element.file.source, () => {
                            audio.loop = true;
                            template.timedAudio(audio, element.delay, element.duration, name);
                        });
                        break;
                    case 'noise':
                        audio = new Tone.Noise(element.source.noise.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                    case 'wave':
                        audio = new Tone.OmniOscillator(element.source.wave.frequency, element.source.wave.type);
                        template.timedAudio(audio, element.delay, element.duration, name);
                        break;
                }
            }
        }
    },
    center() {
        return Template.instance().parent(3).center;
    },
    command(stage, trial, i) {
        if (stage && trial) {
            const template = Template.instance().parent(3),
                session = template.session.get(),
                timers = (template.timers[trial] || {})[stage];

            if (timers) _.each(this['commands'], async (command) => {
                const event = this['type'] + '.' + command.command;

                if (!timers[event]) try {
                    const delay = command.delay + this['delay'];

                    await template.timedCommand(session.device, this['type'], command, delay);
                    template.recordEvent({
                        timeStamp: performance.now(),
                        type: this['type'] + '.' + command.command + '.sent'
                    });
                } catch (error) {
                    console.log(error);
                }
            });
        }
    },
    stage() {
        return Template.instance().parent(3).stage.get();
    },
    timer(delay, duration, type, i) {
        const template = Template.instance().parent(3),
            stage = template.stage.get(),
            trial = template.trial.get() + 1,
            name = type + '.' + i;

        if (!template.timers[trial].hasOwnProperty(stage)) template.timers[trial][stage] = {};
        if (!template.timers[trial][stage][name + '.start']) {
            template.timers[trial][stage][name + '.start'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: type + '.start'});
                template.toggles[name] = true;
                console.log('%c⏳ ' + name + ' start\t', 'color: purple; font-size: 1.5em; font-weight: 800;', performance.now());
            }, delay);

            template.timers[trial][stage][name + '.end'] = Meteor.setTimeout(() => {
                template.recordEvent({timeStamp: performance.now(), type: name + '.end'});
                template.toggles[name] = false;
                console.log('%c⌛ ' + name + ' end\t', 'color: purple; font-size: 1.5em; font-weight: 800;', performance.now());
            }, delay + duration);
        }

        return template.toggles[name];
    },
    trial() {
        return Template.instance().parent(3).trial.get() + 1;
    }
});

Template.trialElement.onCreated(function () {
    this.started = new ReactiveVar(0);
});

Template.trialElement.onRendered(function () {
    Template.instance().started = new ReactiveVar(0);
});

Template.trialElements.helpers({
    responses() {
        return Template.instance().parent(2).responses.get();
    }
});

Template.trialElements.onRendered(function () {
    console.log('%c Trial Elements render:\t' + performance.now() + ' ', 'background: darkgrey; color: white;');
});

Template.trialSVG.events({
    'click'(e, svg) {
        const event = collectClickEvent(e),
            template = svg.parent(),
            stage = svg.data.stage,
            trial = svg.data.trial.number - 1;

        processEvent(event, template, stage, trial);
        // Meteor.call('mqttSend', Meteor.userId(), 'board', {
        //     command: 'pin', pins: 23, state: 'on',
        //     context: {session: data.trial.session, stage: stage, timeStamp: performance.now(), trial: trial}
        // }, () => template.recordEvent({timeStamp: performance.now(), type: 'microscope.start'}));
    }
});

Template.trialSVG.helpers({
    elements(stage, trial) {
        if (trial && stage) return trial.stages[stage - 1];
    },
    ir(stage, trial) {
        const data = trial.data[stage - 1],
            template = Template.instance(),
            triggered = template.triggered.get();

        /** By setting triggered to the updated length of recorded events,
         *  each newly added event is processed only once. */
        if (0 < data.length && triggered < data.length) {
            const last = data[triggered],
            inputs = template.events[last.type];

            /** Only proceed with event processing if inputs governing this event type are found.
             *  Check event against each set of conditions, potentially fulfilling criteria for multiple reactions: */
            _.each(inputs, (input, index) => { //TODO Generalize into processing events from inputs feed (i.e., ir sensor)
                const entry = (last.request && last.request.ir === 1),
                prereq = _.some(data, (e) => (e.type === 'reward' && e.request.reward === "off" && (last.timeStamp - e.timeStamp > 200))); console.log("IR entry?\t" + entry, "\nReward dispensed?\t" + prereq);

                if (entry && prereq) {
                    /** Create reaction event & Collect all of same event type: */
                    const event = 'ir.entry',
                    elements = _.filter(data, (e) => (e.type === event));

                    /** Process the reaction event using template's input conditions: */
                    processEvent({index: triggered, number: (elements.length + 1), timeStamp: last.timeStamp, type: event}, template.parent(), stage, trial.number - 1);
                    console.log('%c⚡ Trial ' + trial.number + ':\t IR Entry ' + (elements.length + 1), 'color:red; font-size: 3em', performance.now());
                }
            });

            /** Will only increment to next data entry in events list */
            template.triggered.set(triggered + 1);
        }
    }
});

Template.trialSVG.onCreated(function () {
    this.events = _.groupBy(this.data.inputs[this.data.stage - 1],"event");
    this.triggered = new ReactiveVar(0);
});

Template.trialSVG.onRendered(function () {
    console.log('%c Trial SVG renders:\t' + performance.now() + ' ', 'background: darkgrey; color: white;');
});
