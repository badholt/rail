import './trial.html';

import '/imports/ui/components/cross';
import '/imports/ui/components/stimulus';

import _ from 'underscore';
import Tone from 'tone';
import update from 'immutability-helper';

import { calculateCenter } from '../../api/client.methods';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Sessions, Trials } from '../../api/collections';
import { Template } from 'meteor/templating';

export const collectClickEvent = (e) => JSON.parse(JSON.stringify(
    _.pick(e, 'clientX', 'clientY', 'timeStamp', 'screenX', 'screenY', 'target', 'type', 'which'),
        (_key, value) => (value instanceof Node) ? {
            classes: value.classList,
            id: value.id,
            parent: { classes: value.parentNode.classList, id: value.parentNode.id }
        } : (value instanceof Window) ? 'Window' : value, ' ')),
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
        if (template.logging.session) template.printEvent('brown', '🆂 Session rendered ');
        /** Sets Session-level timers: */
        if (settings) {
            template.timers.session = {};

            /** Delays onset of first trial: */
            template.timers.session.onset = Meteor.setTimeout(() => {
                template.n.set(0);

                template.recordEvent({ timeStamp: performance.now(), type: 'session.start' });
                if (template.logging.session) template.printEvent('brown', '🆂 Session started ');
            }, settings.session.delay);

            /** Sets timer for session duration: */
            if (settings.session.duration) template.timers.session.end = Meteor.setTimeout(() => template.shutdown(),
                settings.session.delay + settings.session.duration);

            if (template.logging.session) template.printEvent('brown', '🆂 Session timers set ');
        }
    };

Template.trial.helpers({
    abort() {
        const template = Template.instance();
        if (Meteor.user()?.status?.active?.session === '' && template.active.get()) template.shutdown('abort');
    },
    data(settings, stage, trials) {
        if (!settings) return;

        const template = Template.instance(),
            i = template.n.get(),
            n = i + 1;

        if (n <= 0) return;

        const trial = Trials.findOne(trials[ i ]);

        if (!trial) return;

        /** Run once at trial startup: */
        if (!template.timers[ n ]) {
            /** Initialize trial data logging: */
            template.updateContext(n, stage);

            if (template.logging.trials) {
                const orientation = (trial.stages?.length > 1 && trial.stages[ 1 ]?.[ 0 ]?.orientation)
                    ? (trial.stages[ 1 ][ 0 ].orientation.value > 0) ? 'Ｈ' : 'Ｖ' : ''; // TODO: Generalize for alternate stage conditions

                template.printEvent('darkslategrey', `🆃 Trial ${ n } started \n ${ trial.bias
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

        if (!template.active.get()) (session.trials.length === 1) ? template.startup() : FlowRouter.go('/');
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

    this.session = new ReactiveVar();

    this.autorun(() => {
        const session = Sessions.findOne(id);

        if (session) {
            this.session.set(session);

            this.subscribe('experiments.single', session.experiment);
            this.subscribe('users', { _id: session.device });
        }
    });

    /** Set logging level to box profile settings: */
    this.autorun(() => {
        const user = Meteor.user({ fields: { 'profile.logging': 1 } });
        if (user) this.logging = user.profile.logging;
    });

    this.active = new ReactiveVar(false);
    this.center = calculateCenter($(window).height(), $(window).width());
    this.events = new ReactiveVar([]);
    this.i = new ReactiveVar(0);
    this.incorrect = new ReactiveVar([ [ -1, 0 ], [ -1, 0 ] ]);
    this.n = new ReactiveVar(-1);
    this.responses = new ReactiveVar([]);
    this.stage = new ReactiveVar(1);
    this.storage = new ReactiveVar({});
    this.timers = {};
    this.trial = new ReactiveVar({});
    this.toggles = {};

    this.clearTimer = (value, key) => {
        Meteor.clearTimeout(value);
        if (this.logging.timers) this.printEvent('firebrick', `❌ Cleared Timer ${ value } (${ key }) `);
    };
    this.clearTimers = (trial, delay = 0, omit = [], only = [], stage = false) => {
        const n = parseInt(trial, 10),
            i = _.filter(this.timers[ n ], (_, k) => k.startsWith('clear.')).length + 1,
            clearSelected = (timer, type) => {
                const ignore = [ `clear.${ i }`, 'audio', 'lights', 'reward' ].concat(omit);

                if (!_.some(ignore, (j) => type.includes(j))) {
                    this.clearTimer(timer, type);
                } else {
                    if (this.logging.timers) this.printEvent('seagreen', `✔ Kept Timer ${ timer } (${ type }) `);
                }
            },
            clearTrialTimers = (t) => {
                if (t <= 0 || !this.timers[ t ]) return;

                /** Clear timers via specified method: */
                if (only.length > 0) {
                    /** Clear ONLY specified timers & ignore remaining: */
                    _.each(only, (type) => {
                        /** Clear specific stage if specified: */
                        if (stage) return getStageTimer(type, this.timers[ t ][ stage ]);

                        /** Otherwise, clear all stages until match is found: */
                        _.find(this.timers[ t ], (id, key) => {
                            const inTrial = key.includes(type);

                            /** Search stages if not found in trial timers: */
                            if (!inTrial) return getStageTimer(type, id);
    
                            this.clearTimer(id, key);
                            return inTrial;
                        });
                    });
                } else {
                    /** Ignore specified OMIT timers & clear remaining: */
                    _.each(this.timers[ t ], (stage) => _.each(stage, clearSelected));
                } // TODO: Combine omit & only w/ array overlap
            },
            getStageTimer = (type, stage) => _.find(stage, (id, key) => {
                const match = key.includes(type);
                if (match) this.clearTimer(id, key);
                return match;
            });

        if (!n || !i) return;

        /** Clear timers indexed by both trial number, n, & event name: */
        if (omit.length > 0 || only.length > 0) {
            this.timers[ n ][ `clear.${ i }` ] = Meteor.setTimeout(() =>
                _.each(_.range(n, n - 2, -1), clearTrialTimers), delay);
        } else {
            /** Legacy timer clearing for backwards compatibility: */
            _.each(_.range(n, n - 2, -1), (t) => {
                /** Clear ITI timers first, ASAP: */
                if (this.timers[ t ]) {
                    const iti = `trial.${ t }.iti`,
                        id = this.timers[ t ][ iti ];

                    this.clearTimer(id, iti);
                }

                return _.each(this.timers[ t ], (stage) => _.each(stage, (timer, label) => {
                    const whitelist = 'audio' || 'lights' || 'reward';

                    if (!label.includes(whitelist)) {
                        this.clearTimer(timer, label);
                    } else {
                        if (this.logging.timers) this.printEvent('seagreen', `✔ Kept Timer ${ timer } (${ label }) `);
                    }
                }));
            });
        }
    };
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
    this.nextStage = (delay, increment) => {
        const stage = this.stage.get() + increment,
            trial = this.i.get() + 1; // Follows index instead of trial number to allow for duplicates

        /** Initialize trial timers if not already present: */
        this.trialTimers(trial, stage);

        /** Set stage transition timer: */
        this.timers[ trial ][ stage ][ `stage.${ stage }.start` ] = Meteor.setTimeout(() => {
            /** Update hardware inputs to current stage: */
            this.updateContext(trial, stage);
            /** Update trial to current stage: */
            this.stage.set(stage);

            /** Record stage transition: */
            this.recordEvent({ timeStamp: performance.now(), type: `stage.${ stage }.start` });
            if (this.logging.trials) this.printEvent('darkslategrey', `🆂 Stage ${ stage } started `);
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
        if (this.timers[ next ][ stage ][ 'next.trial' ]) {
            const previous = this.timers[ next ][ stage ][ 'next.trial' ];

            this.clearTimer(previous, 'next.trial');
            this.timers[ next ][ stage ][ 'next.trial' ] = null;
        }

        /** Sets new ITI timer for current trial: */
        this.timers[ next ][ stage ][ 'next.trial' ] = Meteor.setTimeout(() => {
            if (next <= session.trials.length) {
                this.processEvent({ timeStamp: performance.now(), type: `trial.${ next }.end` });
                if (this.logging.trials) this.printEvent('darkslategrey', `🆃 Trial ${ next } ended `);

                /** Proceed to next trial or exit: */
                if (session.settings.session.duration || next < session.settings.stages.length) {
                    let bias = false;
                    const c = session.settings.session?.correction,
                        getBias = () => ((c?.bias > 0) ? (c?.bias * 100) >= _.random(100) : false),
                        getIndex = () => {
                            let abort = c?.abort && !duplicate;
                            const storage = this.storage.get(),
                                i = this.i.get(),
                                incorrect = this.incorrect.get(),
                                j = incorrect[ 0 ],
                                o = c?.offset || 0, // Equivalent to number of "gap trials"
                                t = (j[ 0 ] > -1) ? j[ 0 ] : i,
                                correctionTrial = () => {
                                    /** Counts the number of previous trials copied from index j[ 0 ].  If a trial has not been
                                     *  duplicated or replayed beyond the specified limit, a new trial identical to the first at
                                     *  this index is added: */
                                    const n = Trials.find({ index: t }).count();

                                    /** If no correction trials have yet been generated at index j[ 0 ], n = 1, and o "gap trials"
                                     *  are run, offseting the correction trials from the incorrect trial that spawned them by o.
                                     *  Otherwise, correction trials repeat until rejoining the main branch of tracked indices. */
                                    if (n > 1) {
                                        /** Repeat correction trial:
                                         *  If the number of duplicate trials, j[ 1 ], where the next trial added would be n,
                                         *  exceeds the specified amount, stop duplicating the original trial at index j[ 0 ] &
                                         *  calculate bias for all but the last incorrect correction trial. */
                                        if (!abort && n <= j[ 1 ]) {
                                            bias = getBias();
                                            return t; // Returns index of instigating incorrect trial
                                        }

                                        /** Proceed to next index:
                                         *  If one of the gap trials was incorrect, transfer the stored index to the upcoming
                                         *  correction trial slot, incorrect[ 0 ], then allow the index to update to i + 1. */
                                        const k = _.findIndex(incorrect, (gap, slot) => (slot > 0 && gap[ 0 ] > -1));

                                        if (k > -1) {
                                            incorrect[ 0 ] = incorrect[ k ];
                                            incorrect[ k ] = [ -1, 0 ];
                                        } else {
                                            incorrect[ 0 ] = [ -1, 0 ];
                                        }

                                        this.incorrect.set(incorrect);
                                    }
                                    /** Gap Trials:
                                     *  Correction trials for a previous incorrect trial will follow after o "gap trials" have passed,
                                     *  but just like regular trials, an incorrectly answered gap trial will also later spawn its own
                                     *  set of correction trials if identified as incorrect: */
                                    else {
                                        /** Calculate bias if gap trial is instigating trial: */
                                        if (t + o <= i) bias = getBias();
                                        if (duplicate) storeIncorrect();
                                        return t; // Returns index of instigating incorrect trial
                                    }
                                },
                                getAbort = () => {
                                    const stored = storage?.abort ?? 0,
                                        a = (stored < c.abort - 1) ? stored + 1 : 0;

                                    if (a > 0) abort = false;
                                    updateStorage('abort', a);
                                    return (a > 0) ? storage.correction - 1 : 0;
                                },
                                getNext = (n = i + 1) => {
                                    this.i.set(n);
                                    return n; // Returns unused next index
                                },
                                storeIncorrect = () => {
                                    incorrect[ (t > -1 && i < t + o + 1) ? i - t : 0 ] = [ i, duplicate ];
                                    this.incorrect.set(incorrect);
                                },
                                updateStorage = (key, value) => {
                                    if (!key) return;

                                    /** In case of multiple variable changes, update storage reactively: */
                                    this.storage.set(update(this.storage.get(), { [ key ]: { $set: value } }));
                                    Meteor.callAsync('updateTrial', session.trials[ this.n.get() ],
                                        `storage.${ key }`, 'set', value);
                                };

                            /** Ensure sufficient storage exists to compensate for offset, o: */
                            if (incorrect.length < o + 1) {
                                _.times(o + 1 - incorrect.length, () => incorrect.push([ -1, 0 ]));
                                this.incorrect.set(incorrect);
                            }

                            /** Ignore correction trial sequences if not defined in template: */
                            // if (!c) return duplicate ? correctionTrial() ?? getNext() : getNext();
                            if (!c) return getNext();

                            /** Initiate correction trial sequences w/ approach specified in template: */
                            if (!c?.after) {
                                /** Correction Trials:
                                 *  A second asynchronous index, i, simulates a cache for referencing previous trials.
                                 *  If the current index matches the index of an incorrect trial, j[ 0 ], offset by o,
                                 *  a correction trial sequence commences: */
                                if ((j[ 0 ] > -1 && i === j[ 0 ] + o) || (duplicate && o === 0)) {
                                    const ct = correctionTrial();
                                    if (!_.isUndefined(ct)) return ct;
                                }
                                /** Incorrect Non-Correction Trials:
                                 *  If correction trials are enabled, store the index of this instigating trial. */
                                else if (duplicate) { storeIncorrect(); }
                            } else if (c?.after === storage[ storage?.stimulus ]) {
                                /** Track number of correction trials remaining: */
                                const n = (storage.correction > 0)
                                        ? (abort) ? getAbort() : storage.correction - 1
                                        : duplicate,
                                    ct = correctionTrial();

                                updateStorage('correction', n);

                                /** Reset counter after last correction trial, or after aborting trial: */
                                if (n === 0) updateStorage(storage?.stimulus, 0);

                                if (!_.isUndefined(ct)) return ct;
                            }

                            return getNext();
                        };

                    const d = update(this.events.get(), { [ next ]: {
                            $set: _.times(session.settings.inputs.length, () => [])
                        } });

                    // TODO: Verify all local data has been uploaded to DB
                    this.events.set(d);
                    Meteor.call('addTrial', session._id, getIndex(), next + 1, performance.timeOrigin, bias);
                    
                    this.responses.set([]);
                    this.stage.set(1);
                    this.n.set(next);
                } else { this.shutdown(); }
            }
        }, delay);
    };
    this.printEvent = (color, description) => console.log(`%c ${ description }%c @${ performance.now() } `,
        `background: ${ color }; color: white; padding: 0.35em;`,
        `background: #111; color: ${ color }; padding: 0.25em; border: 1px solid ${ color }; font-weight: 800;`);
    this.printTimer = (trial, stage, name, color, description) => console.log(`%c ⌛ Timer ${ this.timers[ trial ][ stage ][ name ] } (${ name })%c ${ description } @${ performance.now() } `,
        `background: ${ color }; color: white; padding: 0.35em;`,
        `background: #111; color: ${ color }; padding: 0.25em; border: 1px solid ${ color }; font-weight: 800;`);
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

        this.recordEvent(event);
    };
    this.recordEvent = (e) => {
        /** If session aborts prematurely, save events to default first trial: */
        const n = (this.n.get() > -1) ? this.n.get() : 0,
            stage = this.stage.get() - 1,
            d = update(this.events.get(), { [ n ]: { [ stage ]: { $push: [ e ] } } }),
            storeEvent = (n, stage) => {
                const session = this.session.get(),
                    id = session.trials[ n ],
                    trial = Trials.findOne({ _id: id, session: session._id });

                if (trial || n === 0) {
                    Meteor.call('updateTrial', id, `data.${ stage }`, 'push', e);
                }
                /** Overtime events recursively search for an updateable prior trial: */
                else if (n > 0) {
                    storeEvent(n - 1, session.settings.inputs.length - 1);
                }
            };

        /** Save to local store for fast historical referencing: */
        this.events.set(d);

        /** Save to database for long-term storage: */
        storeEvent(n, stage);
    };
    this.shutdown = (type = 'end') => {
        const session = this.session.get(),
            n = this.n.get();

        /** Shut down mqtt background services: */
        Meteor.call('mqttSend', session.device, 'sensor', { command: 'detect', detect: 'off' }, () => {
            Meteor.call('mqttSend', session.device, 'client', { command: 'disconnect' });
            if (this.logging.mqtt) this.printEvent('darkgoldenrod', '🅲 Client disconnected ');
        });

        /** Clear aborted session's timers: */
        this.clearTimers(n + 1);

        _.each(this.timers.session, this.clearTimer);

        /** Record shutdown: */
        this.recordEvent({ timeStamp: performance.now(), type: `trial.${ n }.end` });
        this.recordEvent({ timeStamp: performance.now(), type: `session.${ type }` });

        if (this.logging.session) this.printEvent('brown', `${ (type !== 'abort') ? '🆂' : '🚫' } Session ${ type }ed `);

        /** Ensure shutdown only runs once if aborted: */
        this.active.set(false);

        /** Return to homepage: */
        FlowRouter.go('/');
    };
    this.setContext = (session, trial, stage, timeStamp, topic, persistent = false) =>
        Meteor.call('mqttSend', session.device, topic, {
            command: 'set',
            context: !persistent ? { timeStamp } : { session: session._id, stage, timeStamp, trial }
        }, () => this.recordEvent({ timeStamp, topic, type: 'set.context' }));
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
        this.events.set([ _.times(session.settings.inputs.length, () => []) ]);

        /** Start up mqtt background services: */
        Meteor.call('mqttSend', session.device, 'sensor',
            { command: 'detect', detect: 'on', context: { timeStamp: performance.now() } });

        /** Start session after preparations complete: */
        sessionTimers(session.settings, this);
    };
    this.timedAudio = (data, trial, stage) => {
        const timers = this.timers[ trial ][ stage ],
            getNumber = (n) => (data.e.number ?? (timers[ `audio.${ n }.start` ] ? getNumber(n + 1) : n)),
            number = getNumber(1),
            element = update(data.e, { name: { $set: `audio.${ number }` }, number: { $set: number } }),
            start = `${ element.name }.start`,
            stop = `${ element.name }.stop`;

        /** Do not schedule multiple instances of same audio unless allowed: */
        if (timers[ start ]) {
            
            if (!element.multi) return; // TODO: Handle multi behavior / iterations of same audio (ex: allow increment pattern, etc.)
        }

        /** Set up audio: */
        const onstop = () => {
                this.recordEvent(_.extend(element, { timeStamp: performance.now(), type: 'audio.stop' }));
                if (this.logging?.audio) this.printTimer(trial, stage, stop, 'steelblue', '🔈 Stopped');
            },
            audio = getAudioDestination(element, onstop); // TODO: Move to template level to use this, remove onstop variable?

        /** Schedule audio to play: */
        Tone.context.resume().then(() => {
            timers[ start ] = Tone.Transport.schedule((t) => {
                timers[ element.name ] = audio.start(t);

                this.recordEvent(_.extend(element, { timeStamp: performance.now(), type: 'audio.start' }));
                if (this.logging?.audio) this.printTimer(trial, stage, start, 'steelblue',
                    `${ (!element.mute) ? '🔊' : '🔇' } Started`);
            }, `+${ element.delay / 1000 }`);

            timers[ stop ] = Tone.Transport.schedule((t) => audio.stop(t), `+${ (element.delay + element.duration) / 1000 }`);
        });
    };
    this.timedCommand = (device, topic, message, delay, context = true) => {
        if (!message?.command) return;

        const id = this.session.get()._id,
            stage = this.stage.get(),
            timer = `${ topic }.${ message.command }`,
            trial = this.n.get() + 1;

        this.timers[ trial ][ stage ][ timer ] = Meteor.setTimeout(() => {
            const timeStamp = performance.now();

            if (this.logging.mqtt) this.printTimer(trial, stage, timer, 'orange', '💬 Sent');

            return Meteor.call('mqttSend', device, topic, (context)
                ? _.extend(_.omit(message, 'delay'), { context: { session: id, stage, timeStamp, trial } })
                : _.omit(message, 'delay'),
            () => this.recordEvent({ timeStamp, type: `${ timer }.fired` }));
        }, delay);
    };
    this.trialTimers = (n, stage = 1) => {
        /** Sets Trial-level timers: */
        const pre = `trial.${ n }`;

        if (!this.timers[ n ]) this.timers[ n ] = {};
        if (!this.timers[ n ][ stage ]) this.timers[ n ][ stage ] = {};
        if (!this.timers[ n ][ `${ pre }.iti` ]) {
            const iti = this.session.get().settings.session?.iti;

            if (!iti) return;

            /** Sets timer for maximum trial duration: */
            this.timers[ n ][ `${ pre }.iti` ] = Meteor.setTimeout(() => {
                if (this.logging.trials) this.printEvent('cadetblue', `🆃 Trial ${ n } ITI ended `);
                return this.processEvent({ timeStamp: performance.now(), type: 'iti.end' });
            }, iti);

            /** Records trial start: */
            this.recordEvent({ timeStamp: performance.now(), type: `${ pre }.start` });
            if (this.logging.trials) this.printEvent('cadetblue', `🆃 Trial ${ n } ITI started `);
        }
    };
    this.updateContext = (trial, stage) => {
        const session = this.session.get(),
            topics = [
                { topic: 'sensor', persistent: true },
                { topic: 'reward' }
            ]; // TODO: Move to template / db

        _.each(topics, (t) => this.setContext(session, trial, stage, performance.now(), !t.persistent
            ? t.topic : `${ t.topic }/${ session._id }/${ trial }/${ stage }`, t.persistent));
    };
    this.variables = {
        'audio': (d, s, t) => {
            const n = this.n.get() + 1,
                stage = this.stage.get(),
                audio = this.timers[ n ][ stage ][ t ],
                timer = this.timers[ n ][ stage ][ `${ t }.${ s.command }` ]; // Grab first b/c command might overwrite timer

            if (!audio) return;

            this.timers[ n ][ stage ][ `${ t }.${ s.command }` ] = Meteor.setTimeout(() => {
                if (s.command === 'stop') {
                    Tone.Transport.clear(timer);
                    audio.stop();
                }
            }, d);
        },
        /** clear - Clears all timers
         *  Trials are indexed starting at 0, but the timers are referenced starting at Trial 1,
         *  so clearing timers for "next" actually clears the most recent trial. */
        'clear': (d, s, _t) => this.clearTimers(this.n.get() + 1, d, s.omit, s.only, s.stage),
        'center': (p) => (this.center[ p ]),
        'count': (p) => {
            const d = this.events.get(),
                // Count can filter other events like iti.end, but requires all events to pass:
                f = _.filter(d[ this.n.get() ][ this.stage.get() - 1 ], (e) => this.conditionsMet(e, p));

            return f.length;
        },
        'event': (p) => (event[ p ]),
        'insert': (_d, _s, t) => {
            const responses = this.responses.get();

            if (!_.has(responses, t)) responses.push(t);
            this.responses.set(responses);
        },
        'message': (d, s, t) => this.timedCommand(this.session.get().device, t, s.message, d, s.context),
        'number': (n) => (parseFloat(n)),
        'stage': (d, i) => this.nextStage(d, i),
        'store': (_d, s, t) => {
            const storage = this.storage.get();

            /** Correction trials will not modify stored template variables: */
            if (storage.correction > 0) return;

            const v = (s.type === '+') ? storage[ t ] + s.amount : s.value;

            this.storage.set(update(storage, { [ t ]: { $set: v } }));
            Meteor.callAsync('updateTrial', this.session.get().trials[ this.n.get() ], `storage.${ t }`, 'set', v);
        },
        'string': (s) => (s.toString()),
        'style': (d, s, t) => {
            this.timers[ this.n.get() + 1 ][ this.stage.get() - 1 ][ `${ t }.style` ] = Meteor.setTimeout(() =>
                ($(t).css(s.css)), d);
            this.recordEvent({ timeStamp: performance.now(), type: `${ t }.style`, css: s.css });
        },
        'toggle': (d, s, t) => {
            const type = `${ t }${ (s.set) ? '.start' : '.end'}`,
                n = this.n.get() + 1,
                stage = this.stage.get();

            /** Overwrite duration timer(s) of toggled element if allowed in settings: */
            if (this.timers[ n ][ stage ][ type ] && !s.keep) this.clearTimer(this.timers[ n ][ stage ][ type ], type);

            this.timers[ n ][ stage ][ type ] = Meteor.setTimeout(() => {
                this.toggles[ t ] = s.set;

                this.recordEvent({ timeStamp: performance.now(), type });
                if (this.logging.timers) this.printTimer(n, stage, type, 'rebeccapurple',
                    (s.set) ? 'Started' : 'Ended');
            }, d);
        },
        'trial': (d, i, n) => this.nextTrial(d, i, n),
        '<': (o, s) => (o < s),
        '+': (d, s, t) => this.variables[ t ](d, s.amount, s.duplicate),
        '=': (o, s) => (o === s)
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
    command(stage, trial, _i) {
        if (stage && trial) {
            const template = Template.instance().parent(3),
                session = template.session.get(),
                timers = template.timers[ trial ]?.[ stage ];

            if (timers) _.each(this.commands, async (command) => {
                if (_.isEmpty(command) || !_.has(command, "command")) return;

                const event = `${ this.type }.${ command.command }`;

                if (!timers[ event ]) try {
                    const delay = command.delay + this.delay;

                    await template.timedCommand(session.device, this.type, command, delay);
                    template.recordEvent({
                        timeStamp: performance.now(),
                        type: `${ this.type }.${ command.command }.sent`
                    });
                } catch (error) { console.log(error); }
            });
        }
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
                if (template.timers[ trial ][ stage ][ `${ name }.${ action }` ]) return;

                template.timers[ trial ][ stage ][ `${ name }.${ action }` ] = Meteor.setTimeout(() => {
                    template.toggles[ name ] = val;

                    template.recordEvent({ timeStamp: performance.now(), type: `${ type }.${ action }` });
                    if (template.logging.timers) template.printTimer(trial, stage, `${ name }.${ action }`,
                        'rebeccapurple', desc);
                }, t);
            };

        /** Initialize stage timers if nonexistent: */
        if (!template.timers[ trial ][ stage ]) template.timers[ trial ][ stage ] = {};

        /** Set start & end timers for element's specified duration: */
        if (!template.timers[ trial ][ stage ][ `${ name }.start` ]) {
            setTimer('start', delay, 'Started', true);
            setTimer('end', delay + duration, 'Ended', false);
        }

        return template.toggles[ name ];
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
    if (template.logging.trials) template.printEvent('darkslategrey', '🆃 Trial Elements rendered ');
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

                    if (template.parent().logging.sensors) template.parent().printEvent((last.type === 'sensor') ?
                        'red' : 'blue', `⚡ Trial ${ trial.number }:\t IR Entry ${ elements.length + 1 } `);
                }
            });

            /** Will only increment to next data entry in events list */
            /** By end of Session, each stage's count should match number of data entries */
            counts[ stage - 1 ] = count + 1;
            template.count.set(counts);
        }
    }
});


Template.trialSVG.onCreated(function () {
    this.count = new ReactiveVar(_.map(this.data.inputs, () => 0));
    this.events = _.map(this.data.inputs, (stage) => _.groupBy(stage, 'event'));
});

Template.trialSVG.onRendered(() => {
    const template = Template.instance().parent(),
        n = template.n.get(),
        session = template.session.get();

    /** Connect to Messaging Client(s):
     *  The Trial template should only render on device profiles. Thus, only devices should connect to MQTT &
     *  listen in on their own hardware output. */
    Meteor.callAsync('mqttConnect', session.device);
    Meteor.callAsync('updateTrial', session.trials[ n ], 'timeOrigin', 'set', performance.timeOrigin);

    /** Record initial stored values for current trial: */
    _.each(template.storage.get(), (v, k) => Meteor.callAsync('updateTrial', session.trials[ n ],
        `storage.${ k }`, 'set', v));

    if (template.logging.trials) template.printEvent('darkslategrey', '🆃 Trial SVG rendered ');  
});
