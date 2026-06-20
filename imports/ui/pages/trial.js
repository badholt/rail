/**
 * imports/ui/pages/trial.js
 *
 * Purpose:
 *  - Implements the experiment runtime engine
 *  - Coordinates session execution, trial progression, & event processing
 *  - Interfaces w/ MQTT devices, audio playback, & data logging
 *
 * Notes:
 *  - Renders directly into `bare` layout template
 * */

import './trial.html';
import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import update from 'immutability-helper';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import Tone from 'tone';
import _ from 'underscore';
import { Sessions } from '/imports/api/collections';
import { eventBus } from '/imports/services/mqtt';
import { TrialProgression } from '/imports/ui/components/trial/progression';
import { initializeState } from '/imports/ui/components/trial/state';

export const collectClickEvent = (e) => JSON.parse(JSON.stringify(
    _.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
        (_key, value) => (value instanceof Node)
            ? {
                classes: value.classList,
                id: value.id,
                parent: { classes: value.parentNode.classList, id: value.parentNode.id }
              }
            : (value instanceof Window) ? 'Window' : value, ' ')),
    getAudioDestination = (element, onstop) => {
        const audio = getAudioSource(element, onstop);

        if (element.merge) {
            const m = new Tone.Merge().toDestination();

            audio.onstop = () => {
              audio.disconnect(m, 0, element.merge);
              onstop();
            };
            audio.connect(m, 0, Number(element.merge));
        } else if (element.pan) {
            const panner = new Tone.Panner({ pan: element.pan }).toDestination();

            audio.onstop = () => {
              audio.disconnect(panner);
              onstop();
            };
            audio.connect(panner);
        } else {
            audio.toDestination();
        }

        if (element.mute) audio.mute = true;

        return audio;
    },
    getAudioSource = (element, onstop) => {
        switch (element.source.type) {
            case 'file':
                return new Tone.Player({ loop: true, onstop, url: element.file.source });
            case 'noise':
                return new Tone.Noise({ onstop, type: element.source.noise.type });
            case 'wave':
                return new Tone.OmniOscillator({
                    frequency: element.source.wave.frequency,
                    onstop,
                    type: element.source.wave.type
                });
        }
    },
    flipOrientation = (value) => (Math.abs(value - 90)),
    sessionTimers = (settings, template) => {
        if (template.logging.session) template.log.printEvent('brown', '🆂 Session rendered ');
        /** Sets Session-level timers: */
        if (settings) {
            template.TM.timers.session = {};

            /** Delays onset of first trial: */
            template.TM.timers.session.onset = Meteor.setTimeout(() => {
                template.n.set(0);

                template.io.trial.record({ timeStamp: performance.now(), type: 'session.start' });
                if (template.logging.session) template.log.printEvent('brown', '🆂 Session started ');
            }, settings.session.delay);

            /** Sets timer for session duration: */
            if (settings.session.duration) template.TM.timers.session.end = Meteor.setTimeout(() => template.shutdown(),
                settings.session.delay + settings.session.duration);

            if (template.logging.session) template.log.printEvent('brown', '🆂 Session timers set ');
        }
    };

Template.trial.helpers({
    data(settings, stage) {
        if (!settings) return;

        const template = Template.instance(),
            i = template.n.get(),
            n = i + 1;

        if (n <= 0) return;

        const trial = template.trials[ i ];

        if (!trial) return;

        /** Run once at trial startup: */
        if (!template.TM.timers[ n ]) {
            /** Initialize trial data logging: */
            template.updateContext(n, stage);

            if (template.logging.trials) {
                const orientation = (trial.stages?.length > 1 && trial.stages[ 1 ]?.[ 0 ]?.orientation)
                    ? (trial.stages[ 1 ][ 0 ].orientation.value > 0) ? 'Ｈ' : 'Ｖ' : ''; // TODO: Generalize for alternate stage conditions

                template.log.printEvent('darkslategrey', `🆃 Trial ${ n } started \n ${ trial.bias
                    ? '↻' : '' }${ orientation } | Number: ${ trial.number } | Index: ${ trial.index } `);
            }

            /** Initialize trial timers: */
            template.trialTimers(n);

            /** Initialize trial template variables: */
            if (template.storage.get()) template.storage.set(update(template.storage.get(),
                { bias: { $set: trial.bias } }));
        }

        template.trial.set(trial);
        return trial;

    },
    session() {
        const template = Template.instance(),
            session = template.session.get();

        if (!session) return;

        if (!template.active.get()) (template.trials.length === 0) ? template.startup() : FlowRouter.go('/');
        return session;
    },
    stage() {
        return Template.instance().stage.get();
    },
    trial() {
        return Template.instance().n.get();
    }
});

Template.trial.onCreated(function () {
    /** Pull all necessary data related to the session: */
    const id = FlowRouter.getParam('session');

    this.subscribe('sessions.single', id);
    this.subscribe('trials.session', id);

    initializeState(this);

    /** AUTORUNS: */
    this.autorun(() => {
        const session = Sessions.findOne(id);

        if (!session) return;

        this.subscribe('experiments.single', session.experiment);
        this.subscribe('users', { _id: session.device });

        if (!this.initialized) {
            this.session.set(structuredClone(session));
            this.initialized = true;
        }
    });

    /** Set logging level to box profile settings: */
    this.autorun(() => {
        const user = Meteor.user();

        if (user) {
            const { _id, profile, username } = user;

            this.ip = profile.address;
            this.logging = profile.logging;
            this.user = { _id, username };
        }
    });

    /** Session Queue - Runtime Processor: */
    this.autorun(() => {
        const user = Meteor.user(),
            session = user?.status?.active?.session;

        if (!this.active.get() || !session?.queue?.length || session.pointer > session.queue.length) return;

        const { pointer, queue } = session,
            cmd = queue[ pointer ?? 0 ];

        if (!cmd || this.lastCommand.get() === cmd.issuedAt) return;
        this.handleCommand(cmd);
    });

    /** EVENT PROCESSING: */
    this.conditionsMet = (e, input) => _.every(input.conditions, (condition) =>
        _.every(condition.objects, (object) => {
            const target = `${ object.name }.${ object.property }` === 'stimuli.0.orientation.value',
                v = update(this.variables, { event: { $set: (p) => (e[ p ]) } });
            let o = v[ object.name ](object.property);

            if (target && this.trial.get()?.bias) o = flipOrientation(o);

            return _.every(condition.subjects, (subject) => {
                const s = v[ subject.name ](subject.property);
                return v[ condition.comparison ](o, s);
            });
    }));
    this.processEvent = (event) => {
        const session = this.session.get();

        _.each(session.settings.inputs[ this.stage.get() - 1 ], (input) => {
            /** Match event types w/ either literal strings or regex expressions: */
            const pattern = new RegExp(input.event);
            if (!pattern.test(event.type)) return;

            const correct = this.conditionsMet(event, input);

            _.each((correct) ? input.correct : input.incorrect, (action) =>
                _.each(action.targets, (target) =>
                    this.variables[ action.action ](action.delay ?? 0, action.specifications ?? {}, target)));
        });

        this.io.trial.record(event);
    };
    this.timedAudio = (data, trial, stage) => {
        const trialTimers = this.TM.timers[ trial ];

        if (!trialTimers) return;

        const timers = trialTimers[ stage ];

        if (!timers) return;

        const getNumber = (n) => (data.e.number ?? (timers[ `audio.${ n }.start` ] ? getNumber(n + 1) : n)),
            number = getNumber(1),
            element = update(data.e, { name: { $set: `audio.${ number }` }, number: { $set: number } }),
            start = `${ element.name }.start`,
            stop = `${ element.name }.stop`;

        /** Do not schedule multiple instances of same audio unless allowed: */
        if (timers[ start ] && !element.multi) return; // TODO: Handle multi behavior / iterations of same audio (ex: allow increment pattern, etc.)

        /** Set up audio: */
        const onstop = () => {
                this.io.trial.record(_.extend(element, { timeStamp: performance.now(), type: 'audio.stop' }));
                if (this.logging?.audio) this.log.printTimer(trial, stage, stop, 'steelblue', '🔈 Stopped');
            },
            audio = getAudioDestination(element, onstop); // TODO: Move to template level to use this, remove onstop variable?

        /** Schedule audio to play: */
        Tone.context.resume().then(() => {
            timers[ start ] = Tone.Transport.schedule((t) => {
                timers[ element.name ] = audio.start(t);

                this.io.trial.record(_.extend(element, { timeStamp: performance.now(), type: 'audio.start' }));
                if (this.logging?.audio) this.log.printTimer(trial, stage, start, 'steelblue',
                    `${ (!element.mute) ? '🔊' : '🔇' } Started`);
            }, `+${ element.delay / 1000 }`);

            timers[ stop ] = Tone.Transport.schedule((t) => audio.stop(t), `+${ (element.delay + element.duration) / 1000 }`);
        });
    };
    this.timedCommand = (topic, msg, delay, context = true) => {
        if (!msg?.command) return;

        const id = this.session.get()._id,
            stage = this.stage.get(),
            timer = `${ topic }.${ msg.command }`,
            trial = this.n.get() + 1,
            message = (context)
                ? _.extend(_.omit(msg, 'delay'), { context: {
                        session: id,
                        stage,
                        timeStamp: performance.now(),
                        trial 
                    } })
                : _.omit(msg, 'delay');

        this.TM.timers[ trial ][ stage ][ timer ] = Meteor.setTimeout(() =>
            this.io.mqtt.command(message, timer, topic), delay);
        this.log.recordTimer(timer, 'sent', '💬 Sent', false, 'mqtt');
    };

    /** CONTEXT MANAGEMENT: */
    this.setContext = (session, trial, stage, timeStamp, topic, persistent = false) => {
        const context = !persistent ? { timeStamp } : { session, stage, timeStamp, trial };
        this.io.mqtt.context(context, topic);
    };
    this.updateContext = (trial, stage) => {
        const session = this.session.get()._id,
            topics = [
                { topic: 'sensor', persistent: true },
                { topic: 'reward' }
            ]; // TODO: Move to template / db

        _.each(topics, (t) => this.setContext(session, trial, stage, performance.now(), !t.persistent
            ? t.topic : `${ t.topic }/${ session }/${ trial }/${ stage }`, t.persistent));
    };

    /** TRIAL PROGRESSION: */
    this.nextStage = (delay, increment) => {
        const stage = this.stage.get() + increment,
            trial = this.i.get() + 1; // Follows index instead of trial number to allow for duplicates

        /** Initialize trial timers if not already present: */
        this.trialTimers(trial, stage);

        /** Set stage transition timer: */
        this.TM.timers[ trial ][ stage ][ `stage.${ stage }.start` ] = Meteor.setTimeout(() => {
            /** Update hardware inputs to current stage: */
            this.updateContext(trial, stage);
            /** Clear data from previous stage's inputs: */
            this.responses.set([]);
            /** Update trial to current stage: */
            this.stage.set(stage);

            /** Record stage transition: */
            this.io.trial.record({ timeStamp: performance.now(), type: `stage.${ stage }.start` });
            if (this.logging.trials) this.log.printEvent('darkslategrey', `🆂 Stage ${ stage } started `);
        }, delay);
    };
    this.nextTrial = (delay, increment, duplicate) => {
        const stage = this.stage.get(),
            next = this.n.get() + increment,
            session = this.session.get();

        /** Initialize trial timers if not already present: */
        this.trialTimers(next, stage);

        // TODO: Manage multiple next.trial timers (Verify always set timer / removal of if-else's else doesn't mess things up)
        // A next trial timer will now always override any previous next trial timers after clearing them
        if (this.TM.timers[ next ][ stage ][ 'next.trial' ]) {
            const previous = this.TM.timers[ next ][ stage ][ 'next.trial' ];

            this.TM.clearTimer(previous, 'next.trial');
            this.TM.timers[ next ][ stage ][ 'next.trial' ] = null;
        }

        /** Sets new ITI timer for current trial: */
        this.TM.timers[ next ][ stage ][ 'next.trial' ] = Meteor.setTimeout(() => {
            if (next <= this.trials.length) {
                this.processEvent({ timeStamp: performance.now(), type: `trial.${ next }.end` });
                if (this.logging.trials) this.log.printEvent('darkslategrey', `🆃 Trial ${ next } ended `);

                /** Proceed to next trial or exit: */
                if (session.settings.session.duration || next < session.settings.stages.length) {
                    const c = session.settings.session?.correction,
                        progress = new TrialProgression(this),
                        i = progress.getIndex(c, duplicate); // Must run, so that bias is set

                    this.io.trial.add(i, next + 1, performance.timeOrigin, progress.bias);
                    this.responses.set([]);
                    this.stage.set(1);
                    this.n.set(next);
                } else { this.shutdown(); }
            }
        }, delay);
    };
    this.trialTimers = (n, stage = 1) => {
        /** Sets Trial-level timers: */
        const pre = `trial.${ n }`;

        if (!this.TM.timers[ n ]) this.TM.timers[ n ] = {};
        if (!this.TM.timers[ n ][ stage ]) this.TM.timers[ n ][ stage ] = {};
        if (!this.TM.timers[ n ][ `${ pre }.iti` ]) {
            const iti = this.session.get().settings.session?.iti;

            if (!iti) return;

            /** Sets timer for maximum trial duration: */
            this.TM.timers[ n ][ `${ pre }.iti` ] = Meteor.setTimeout(() => {
                if (this.logging.trials) this.log.printEvent('cadetblue', `🆃 Trial ${ n } ITI ended `);
                return this.processEvent({ timeStamp: performance.now(), type: 'iti.end' });
            }, iti);

            /** Records trial start: */
            this.io.trial.record({ timeStamp: performance.now(), type: `${ pre }.start` });
            if (this.logging.trials) this.log.printEvent('cadetblue', `🆃 Trial ${ n } ITI started `);
        }
    };

    /** SESSION LIFECYCLE: */
    this.startup = () => {
        /** Toggle template, so that startup runs only once: */
        this.active.set(true);

        const session = this.session.get(),
            elements = _.unique(_.pluck(_.flatten(session.settings.stages), 'type'));

        /** Add self-referential variables for each element in stages: */
        _.each(elements, (e) => {
            if (!_.has(this.variables, e)) this.variables[ e ] = (p) => {
                /** Must filter stimuli by data index due to potential correction trial sequence offsets: */
                const i = this.trial.get().index,
                    elements = _.filter(this.session.get().settings.stages[ i ][ this.stage.get() - 1 ],
                        (element) => (element.type === e));

                return _.property(p.split('.'))(elements);
            }
        });

        /** Set initial values for any stored template variables: */
        this.storage.set(session.settings.session.storage);

        /** Prepare local copy of trial 1 data: */
        this.io.trial.add(0, 1, performance.timeOrigin, false);

        /** Start up mqtt background services: */
        this.io.mqtt.sensorOn();

        /** Start session after preparations complete: */
        sessionTimers(session.settings, this);

        /** Update client status: */
        eventBus.emit('client:state', { state: 'busy', params: { task: session._id }, user: this.user.username });
    };
    this.shutdown = (type = 'end') => {
        const n = this.n.get();

        /** Shut down mqtt background services: */
        this.io.mqtt.sensorOff();

        /** Clear aborted session's timers: */
        this.TM.clearTimers(n + 1);

        _.each(this.TM.timers.session, this.TM.clearTimer);

        /** Record shutdown: */
        this.io.trial.record({ timeStamp: performance.now(), type: `trial.${ n }.end` });
        this.io.trial.record({ timeStamp: performance.now(), type: `session.${ type }` });

        if (this.logging.session) this.log.printEvent('brown', `${ (type !== 'abort') ? '🆂' : '🚫' } Session ${ type }ed `);

        /** Ensure shutdown only runs once if aborted: */
        this.active.set(false);

        /** Advance session queue: */
        eventBus.emit('queue:advance', { type, user: this.user._id });

        /** Update client status: */
        eventBus.emit('client:state', { state: 'idle', user: this.user.username });

        /** Return to homepage: */
        FlowRouter.go('/');
    };
});

Template.trial.onDestroyed(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
});

Template.trial.onRendered(() => {
    Tone.Transport.start();
});

Template.trialElement.helpers({
    audio(stage, trial) {
        if (!stage || !trial) return;

        const template = Template.instance();

        /** Ensure each audio source only initializes once: */
        if (template.started.get() !== trial) {
            template.started.set(trial);
            template.get('timedAudio')(template.data, trial, stage);
        }
    },
    center() {
        return Template.instance().get('center');
    },
    command(stage, trial) {
        if (!stage || !trial) return;

        const template = Template.instance().parent(3),
            timers = template.TM.timers[ trial ]?.[ stage ];

        if (timers) _.each(this.commands, async (c) => {
            if (_.isEmpty(c) || !_.has(c, "command")) return;

            if (!timers[ `${ this.type }.${ c.command }` ]) try {
                await template.timedCommand(this.type, c, (c.delay ?? 0) + (this.delay ?? 0));
            } catch (error) { console.error(error); }
        });
    },
    stage() {
        return Template.instance().get('stage').get();
    },
    timer(delay, duration, type, i) {
        const template = Template.instance().parent(3),
            stage = template.stage.get(),
            trial = template.n.get() + 1,
            name = `${ type }.${ i }`,
            setTimer = (action, t, desc, val) => {
                if (template.TM.timers[ trial ][ stage ][ `${ name }.${ action }` ]) return;

                template.TM.timers[ trial ][ stage ][ `${ name }.${ action }` ] = Meteor.setTimeout(() => {
                    template.toggles.set(name, val);
                    template.log.recordTimer(type, action, desc, i);
                }, t);
            };

        /** Initialize stage timers if nonexistent: */
        if (!template.TM.timers[ trial ][ stage ]) template.TM.timers[ trial ][ stage ] = {};

        /** Set start & end timers for element's specified duration: */
        if (!template.TM.timers[ trial ][ stage ][ `${ name }.start` ]) {
            setTimer('start', delay, 'Started', true);
            setTimer('end', delay + duration, 'Ended', false);
        }

        return template.toggles.get(name);
    },
    trial() {
        return Template.instance().get('n').get() + 1;
    }
});

Template.trialElement.onCreated(function () { this.started = new ReactiveVar(0); });

Template.trialElements.helpers({
    responses() {
        return Template.instance().get('responses').get();
    }
});

Template.trialElements.onRendered(() => {
    const template = Template.instance().parent(2);
    if (template.logging.trials) template.log.printEvent('darkslategrey', '🆃 Trial Elements rendered ');
});

Template.trialSVG.events({
    'click'(e, svg) {
        const event = collectClickEvent(e);
        svg.parent().processEvent(event);
    }
});

Template.trialSVG.helpers({
    elements(stage, trial) {
        if (stage && trial) return trial.stages[stage - 1];
    },
    ir(stage, trial) {
        const data = trial.data[ stage - 1 ],
            template = Template.instance(),
            counts = template.count.get(),
            count = counts[ stage - 1 ];

        /** By setting count to the updated length of recorded events,
         *  each newly added event is processed only once. */
        if (0 < data.length && count < data.length) {
            const last = data[ count ],
                inputs = template.events[ stage - 1 ][ last.type ];

            /** Only proceed with event processing if inputs governing this event type are found.
             *  Check event against each set of conditions, potentially fulfilling criteria for multiple reactions: */
            _.each(inputs, () => { // TODO: Generalize into processing events from inputs feed (i.e., ir sensor)
                let timeStamp = 0;

                if (last.type === 'sensor') {
                    /** Only entries may trigger a reponse, exits are ignored: */
                    const entry = (last?.request?.ir === 0),
                        /** Conditions are met if reward dispense has already ended: */
                        prereq = _.some(data, (e) => (e.type === 'reward' && e.request.reward === "off"));

                    /** Save event timestamp if a sensor entry has occurred at least 200ms after reward dispense: */
                    if (entry && prereq) timeStamp = last.timeStamp;
                }

                /** If a timestamp was collected,  */
                if (timeStamp > 0) {
                    /** Create reaction event, collecting all of same event type: */
                    const event = 'ir.entry',
                        elements = _.filter(data, (e) => (e.type === event));

                    /** Process the reaction event using template's input conditions: */
                    template.parent().processEvent({ index: count, number: (elements.length + 1),
                        timeStamp: timeStamp, type: event });

                    if (template.parent().logging.sensors) template.parent().log.printEvent((last.type === 'sensor') ?
                        'red' : 'blue', `⚡ Trial ${ trial.number }:\t IR Entry ${ elements.length + 1 } `);
                }
            });

            /** Will only increment to next data entry in events list */
            /** By end of Session, each stage's count should match number of data entries */
            counts[ stage - 1 ] = count + 1;
            template.count.set(counts);
        }
    },
    stage() {
        return Template.instance().get('stage').get();
    }
});

Template.trialSVG.onCreated(function () {
    this.count = new ReactiveVar(_.map(this.data.inputs, () => 0));
    this.events = _.map(this.data.inputs, (stage) => _.groupBy(stage, 'event'));
});

Template.trialSVG.onRendered(() => {
    const template = Template.instance().parent();

    /** Record initial stored values for current trial: */
    template.io.trial.initialize(performance.timeOrigin);

    if (template.logging.trials) template.log.printEvent('darkslategrey', '🆃 Trial SVG rendered ');  
});
