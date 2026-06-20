/**
 * imports/ui/components/trial/variables.js
 *
 * Purpose:
 *  - Runtime evaluation environment for declarative event rules
 *
 * Notes:
 *  - Executes JSON-based expression tree templates
 * */

export function getVariables(instance) {
    return {
        'audio': (d, s, t) => {
            const n = instance.n.get() + 1,
                stage = instance.stage.get(),
                audio = instance.TM.timers[ n ][ stage ][ t ],
                timer = instance.TM.timers[ n ][ stage ][ `${ t }.${ s.command }` ]; // Grab first b/c command might overwrite timer

            if (!audio) return;

            instance.TM.timers[ n ][ stage ][ `${ t }.${ s.command }` ] = Meteor.setTimeout(() => {
                if (s.command === 'stop') {
                    Tone.Transport.clear(timer);
                    audio.stop();
                }
            }, d);
        },
        /** clear - Clears all timers
         *  Trials are indexed starting at 0, but the timers are referenced starting at Trial 1,
         *  so clearing timers for "next" actually clears the most recent trial. */
        'clear': (d, s, _t) => instance.TM.clearTimers(instance.n.get() + 1, d, s.omit, s.only, s.stage),
        'center': (p) => (instance.center[ p ]),
        'count': (p) => {
            const events = instance.trials[ instance.n.get() ].data[ instance.stage.get() - 1 ],
                // Count can filter other events like iti.end, but requires all events to pass:
                f = _.filter(events, (e) => instance.conditionsMet(e, p));

            return f.length;
        },
        'event': (p) => (event[ p ]),
        'insert': (_d, _s, t) => {
            const responses = instance.responses.get();

            if (!_.has(responses, t)) responses.push(t);
            instance.responses.set(responses);
        },
        'message': (d, s, t) => instance.timedCommand(instance.session.get().device, t, s.message, d, s.context),
        'number': (n) => (parseFloat(n)),
        'stage': (d, i) => instance.nextStage(d, i),
        'store': (_d, s, t) => {
            const storage = instance.storage.get();

            /** Correction trials will not modify stored template variables: */
            if (storage.correction > 0) return;

            instance.io.storage.update(t, (s.type === '+') ? storage[ t ] + s.amount : s.value);
        },
        'string': (s) => (s.toString()),
        'style': (d, s, t) => {
            instance.TM.timers[ instance.n.get() + 1 ][ instance.stage.get() - 1 ][ `${ t }.style` ] = Meteor.setTimeout(() =>
                ($(t).css(s.css)), d);
            instance.io.trial.record({ timeStamp: performance.now(), type: `${ t }.style`, css: s.css });
        },
        'toggle': (d, s, t) => {
            const type = `${ t }${ (s.set) ? '.start' : '.end'}`,
                n = instance.n.get() + 1,
                stage = instance.stage.get();

            /** Overwrite duration timer(s) of toggled element if allowed in settings: */
            if (instance.TM.timers[ n ][ stage ][ type ] && !s.keep) instance.TM.clearTimer(instance.TM.timers[ n ][ stage ][ type ], type);

            instance.TM.timers[ n ][ stage ][ type ] = Meteor.setTimeout(() => {
                instance.toggles.set(t, s.set);
                instance.log.recordTimer(type, false, (s.set) ? 'Started' : 'Ended');
            }, d);
        },
        'trial': (d, i, n) => instance.nextTrial(d, i, n),
        '<': (o, s) => (o < s),
        '+': (d, s, t) => instance.variables[ t ](d, s.amount, s.duplicate),
        '=': (o, s) => (o === s)
    };
}
