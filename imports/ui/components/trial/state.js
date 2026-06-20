/**
 * imports/ui/components/trial/state.js
 *
 * Purpose:
 *  - Initializes runtime engine state & services
 * */

import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { calculateCenter } from '/imports/api/client.methods';
import { createIO } from './io.js';
import { createLog } from './log.js';
import { TimerManager } from './timers.js';
import { getVariables } from './variables.js';

export function initializeState(instance) {
    instance.active = new ReactiveVar(false);

    instance.center = calculateCenter(
        $(window).height(),
        $(window).width()
    );

    instance.events = new ReactiveVar([]);
    instance.i = new ReactiveVar(0);
    instance.io = createIO(instance);
    instance.incorrect = new ReactiveVar([ [-1, 0], [-1, 0] ]);
    instance.lastCommand = new ReactiveVar(null);
    instance.log = createLog(instance);
    instance.n = new ReactiveVar(-1);
    instance.responses = new ReactiveVar([]);
    instance.session = new ReactiveVar();
    instance.stage = new ReactiveVar(1);
    instance.storage = new ReactiveVar({});
    instance.TM = new TimerManager(instance);
    instance.toggles = new ReactiveDict();
    instance.trial = new ReactiveVar({});
    instance.trials = [];
    instance.variables = getVariables(instance);

    instance.handleCommand = (cmd) => {
        switch (cmd.type) {
            case 'abort':
                instance.shutdown('abort');
                instance.lastCommand.set(cmd.issuedAt);
                break;

            default:
                return;
        }
    };
}
