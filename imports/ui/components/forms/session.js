import './session.html';

import _ from "underscore";

import { calculateTotal } from '/imports/api/client.methods';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from "meteor/templating";

Template.sessionForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($(`#${ target.form.id }`).form('get value', target.name));

        if (!_.isNaN(value)) {
            const form = template.parent(2),
                split = target.name.split('.'),
                property = split[ 1 ],
                session = form.session.get();

            switch (property) {
                case 'correct':
                case 'delay':
                case 'light.duration':
                case 'total':
                    session[ property ] = value;
                    form.session.set(session);
                    break;
                case 'duration':
                case 'iti':
                    session[ property ] = value;                    
                    if (session.distribution) session.distribution.size = calculateTotal(session);
                    form.session.set(session);
                    break;
                case 'correction':
                    switch (split[ 2 ]) {
                        case 'bias':
                        case 'number':
                        case 'offset':
                            if (session.correction) session[ property ][ split[ 2 ] ] = value;
                            form.session.set(session);
                            break;
                    }
                    break;
                case 'distribution':
                    switch (split[ 2 ]) {
                        case 'multiplier':
                            session[ property ][ split[ 2 ] ] = value;
                            session[ property ].size = calculateTotal(session);
                            form.session.set(session);
                            break;
                        case 'size': {
                            session[ property ][ split[ 2 ] ] = value;

                            /** Calculate default distribution size w/ multiplier of 1: */
                            const n = calculateTotal(_.defaults({ 'distribution': { 'multiplier': 1 } }, session));
                            
                            session[ property ].size = value;
                            session[ property ].multiplier = parseFloat((value / n).toFixed(5));
                            form.session.set(session);
                            break;
                        }
                        default:
                            session[ property ][ split[ 2 ] ] = value;
                            form.session.set(session);
                            break;
                    }
                    break;
            }
        }
    }
});

Template.sessionForm.helpers({
    base() {
        return calculateTotal(_.defaults({ 'distribution': { 'multiplier': 1 } }, Template.currentData()));
    },
    modify() {
        return Template.instance().modify.get();
    },
    remainder(p) {
        /** Truncate value to 5 significant decimal places, so that each percentage has 3 decimal places (i.e., 0.55555 => 55.555%): */
        return parseFloat((1 - p).toFixed(5));
    },
    sample(ratio, size) {
        const colors = [ 'blue', 'orange', 'green', 'red', 'yellow', 'violet', 'pink', 'brown', 'teal', 'purple', 'olive', 'grey' ],
            combinations = [ { 'orientation': 0 }, { 'orientation': 90 } ],
            weights = [ ratio, parseFloat((1 - ratio).toFixed(5)) ], // DUMMY VAR
            portion = (w) => Math.floor(size * w),
            sum = _.map(weights, (w) => portion(w)).reduce((memo, p) => memo + p);

        return _.map(weights, (w, i) => ({
            'color': colors[ i ],
            'variable': (combinations[ i ].orientation !== 0) ? 'H' : 'V', // DUMMY VARS
            'weight': (i < weights.length - 1 || sum === size) ? portion(w) : portion(w) + Math.floor(size - sum)
        }));
    }
});

Template.sessionForm.onCreated(function () {
    this.modify = new ReactiveVar(false);
});

Template.sessionForm.onRendered(() => {
    const template = Template.instance();

    $('.ui.checkbox').checkbox({
        onChecked: () => template.modify.set(true),
        onUnchecked: () => template.modify.set(false)
    });
});
