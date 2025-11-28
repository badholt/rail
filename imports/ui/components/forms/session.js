import './session.html';

import _ from "underscore";
import update from 'immutability-helper';

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
            }
        }
    }
});


Template.trialSpecificationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($(`#${ target.form.id }`).form('get value', target.name));

        if (!_.isNaN(value)) {
            const form = template.parent(3),
                split = target.name.split('.'),
                property = split[ 1 ],
                session = form.session.get();

            switch (property) {
                case 'correction':
                    switch (split[ 2 ]) {
                        case 'after':
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

Template.trialSpecificationForm.helpers({
    base() {
        return calculateTotal(_.defaults({ 'distribution': { 'multiplier': 1 } }, Template.currentData()));
    },
    instigate() {
        const template = Template.instance();
        if (!template.parent(3).session.get().correction?.after) template.instigate.set(false);
        return template.instigate.get();
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

Template.trialSpecificationForm.onCreated(function () {
    this.instigate = new ReactiveVar((this.data?.correction?.after));
    this.modify = new ReactiveVar(false);
});

Template.trialSpecificationForm.onRendered(() => {
    const template = Template.instance(),
        form = template.parent(3),
        toggle = (key) => form.session.set(update(form.session.get(), { correction: { $toggle: [ key ] } })),
        updateAfter = (value) => form.session.set(update(form.session.get(),
                { correction: { after: { $set: value } } }));
    let after = template.data.correction?.after;

    template.$('.ui.checkbox:has(input[name="session.correction.abort"])').checkbox({
        onChange: () => toggle('abort')
    });
    template.$('.ui.checkbox:has(input[name="session.correction.instigate"])').checkbox({
        onChecked: () => {
            if (!template.data.correction?.after) updateAfter(after ?? 1);
            template.instigate.set(true);
        },
        onUnchecked: () => {
            updateAfter(0);
            template.instigate.set(false);
        }
    });
    template.$('.ui.checkbox:has(input[name="session.distribution.modify"])').checkbox({
        onChecked: () => template.modify.set(true),
        onUnchecked: () => template.modify.set(false)
    });
});
