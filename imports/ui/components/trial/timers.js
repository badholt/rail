/**
 * imports/ui/components/trial/timers.js
 *
 * Purpose:
 *  - Manages timed events for runtime engine
 *
 * Notes:
 *  - Tracks & clears nested trial/stage timers
 *  - Prevents timer leakage across trials & sessions
 * */

export class TimerManager {
    constructor(instance) {
        this.instance = instance;
        this.timers = {};
    }

    clearTimer = (value, key) => {
        Meteor.clearTimeout(value);

        if (!this.instance.logging?.timers) return;

        this.instance.log.printEvent('firebrick', `❌ Cleared Timer ${ value } (${ key }) `);
    }

    clearTimers = (trial, delay = 0, omit = [], only = [], stage = false) => {
        const n = parseInt(trial, 10),
            t = this.timers[ n ];

        if (!Number.isFinite(n) || !t) return;

        const i = _.filter(t, (_, k) => k.startsWith('clear.')).length + 1,
            clearSelected = (timer, type) => {
                const ignore = [ `clear.${ i }`, 'audio', 'lights', 'reward' ].concat(omit);

                if (!_.some(ignore, (j) => type.includes(j))) {
                    this.clearTimer(timer, type);
                } else if (this.instance.logging?.timers) {
                    this.instance.log.printEvent('seagreen', `✔ Kept Timer ${ timer } (${ type }) `);
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

        if (!i) return;

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

                const whitelist = ['audio', 'lights', 'reward'];

                _.each(this.timers[ t ], (stage) => _.each(stage, (timer, label) => {
                    const keep = whitelist.some(w => label.includes(w));

                    if (!keep) {
                        this.clearTimer(timer, label);
                    } else if (this.instance.logging?.timers) {
                        this.instance.log.printEvent('seagreen', `✔ Kept Timer ${ timer } (${ label }) `);
                    }
                }));
            });
        }
    }
}
