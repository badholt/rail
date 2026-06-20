/**
 * imports/ui/components/trial/progression.js
 *
 * Purpose:
 *  - Controls trial sequencing & state transitions
 *  - Handles correction & gap trial branching logic
 *
 * Notes:
 *  - Index tracks position in the trial definition list
 *  - Number tracks runtime trial instances
 * */

import _ from 'underscore';

export class TrialProgression {
    constructor(instance) {
        this.instance = instance;
        this.bias = false;
    }

    /**
     *  Processes correction trial state, determines whether trial progression continues through a
     *  correction trial sequence.
     * 
     *  @param {number}  i          Current position within the definitions list
     *  @param {Array}   incorrect  Queue of incorrect trial definition indices
     *  @param {number}  o          Number of gap trials before correction sequence begins
     *  @param {number}  t          Index of the trial definition initiating the correction sequence
     * 
     *  @returns {number|undefined}
     *    undefined => continue normal progression through the trial definitions list
     *    number    => generate the next trial from the definition at this index
     */
    correctionTrial = (abort, c, duplicate, i, incorrect, j, o, t) => {
        /** Counts the number of previous trials copied from index j[ 0 ].  If a trial has not been
         *  duplicated or replayed beyond the specified limit, a new trial identical to the first at
         *  this index is added: */
        const n = this.instance.io.trial.count(t);

        /** If no correction trials have yet been generated at index j[ 0 ], n = 1, and o "gap trials"
         *  are run, offseting the correction trials from the incorrect trial that spawned them by o.
         *  Otherwise, correction trials repeat until rejoining the main branch of tracked indices. */
        if (n > 1) {
            /** Repeat correction trial:
             *  If the number of duplicate trials, j[ 1 ], where the next trial added would be n,
             *  exceeds the specified amount, stop duplicating the original trial at index j[ 0 ] &
             *  calculate bias for all but the last incorrect correction trial. */
            if (!abort && n <= j[ 1 ]) {
                this.bias = this.getBias(c);
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

            this.instance.incorrect.set(incorrect);
        }
        /** Gap Trials:
         *  Correction trials for a previous incorrect trial will follow after o "gap trials" have passed,
         *  but just like regular trials, an incorrectly answered gap trial will also later spawn its own
         *  set of correction trials if identified as incorrect: */
        else {
            /** Calculate bias if gap trial is instigating trial: */
            if (t + o <= i) this.bias = this.getBias(c);
            if (duplicate) this.storeIncorrect(duplicate, i, incorrect, o, t);

            return t; // Returns index of instigating incorrect trial
        }
    }

    getAbort = (c, storage) => {
        const stored = storage?.abort ?? 0,
            a = (stored < c.abort - 1) ? stored + 1 : 0;

        this.instance.io.storage.update('abort', a);

        return (a > 0) ? storage.correction - 1 : 0;
    }

    getBias = (c) => ((c?.bias > 0) ? (c?.bias * 100) >= _.random(100) : false)


    /**
     *  Determines the index of the next trial in a session.
     * 
     *  @returns {number}
     *    number    => generate the next trial from the definition at this index
     */
    getIndex = (c, duplicate) => {
        this.bias = false; // Guarantees state if different logic path in future

        const abort = c?.abort && !duplicate,
            i = this.instance.i.get(),
            incorrect = this.instance.incorrect.get(),
            storage = this.instance.storage.get();

        /** Ignore correction trial sequences if not fully defined in template: */
        if (!c || !storage || incorrect.length <= 0) return this.getNext(i);

        const ct = this.getSequence(abort, c, duplicate, i, incorrect, storage);
        if (!_.isUndefined(ct)) return ct;

        return this.getNext(i);
    }

    getNext = (i) => {
        this.instance.i.set(i + 1);
        return i + 1; // Returns unused next index
    }

    /**
     *  Determines whether trial progression should branch into a correction trial.
     * 
     *  @returns {number|undefined}
     *    undefined => continue normal progression through the trial definitions list
     *    number    => generate the next trial from the definition at this index
     */
    getSequence = (abort, c, duplicate, i, incorrect, storage) => {
        const { correction, stimulus } = storage,
            j = incorrect[ 0 ],
            o = c?.offset || 0, // Equivalent to number of "gap trials"
            t = (j[ 0 ] > -1) ? j[ 0 ] : i;

        /** Ensure sufficient storage exists to compensate for offset, o: */
        if (incorrect.length < o + 1) {
            _.times(o + 1 - incorrect.length, () => incorrect.push([ -1, 0 ]));
            this.instance.incorrect.set(incorrect);
        }

        /** Initiate correction trial sequences w/ approach specified in template: */
        if (!c?.after) {
            /** Correction Trials:
             *  A second asynchronous index, i, simulates a cache for referencing previous trials.
             *  If the current index matches the index of an incorrect trial, j[ 0 ], offset by o,
             *  a correction trial sequence commences: */
            if ((j[ 0 ] > -1 && i === j[ 0 ] + o) || (duplicate && o === 0)) {
                const ct = this.correctionTrial(abort, c, duplicate, i, incorrect, j, o, t);
                if (!_.isUndefined(ct)) return ct;
            }
            /** Incorrect Non-Correction Trials:
             *  If correction trials are enabled, store the index of this instigating trial. */
            else if (duplicate) {
                this.storeIncorrect(duplicate, i, incorrect, o, t);
            }
        } else if (c?.after === storage[ stimulus ]) {
            /** Track number of correction trials remaining: */
            const n = (correction > 0)
                    ? (abort ? this.getAbort(c, storage) : correction - 1)
                    : duplicate,
                ct = this.correctionTrial(abort, c, duplicate, i, incorrect, j, o, t);

            this.instance.io.storage.update('correction', n);

            /** Reset counter after last correction trial, or after aborting trial: */
            if (n === 0) this.instance.io.storage.update(stimulus, 0);

            if (!_.isUndefined(ct)) return ct;
        }
    }

    storeIncorrect = (duplicate, i, incorrect, o, t) => {
        incorrect[ (t > -1 && i < t + o + 1) ? i - t : 0 ] = [ i, duplicate ];
        this.instance.incorrect.set(incorrect);
    }
}
