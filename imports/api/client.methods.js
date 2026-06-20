/**
 * api/client.methods.js
 *
 * Purpose:
 *  - Client-side utility functions & Meteor method wrappers for session logic
 *
 * Notes:
 *  - Some methods are invoked server-side via Meteor.methods
 * */

import update from 'immutability-helper';
import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

export const calculateCenter = (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    calculateTotal = (session) => (session.duration)
        ? Math.round(session.duration / session.iti * (session?.distribution?.multiplier ?? 1.25))
        : session.total,
    calculateWeights = (blacklist, total) => {
        const selected = _.filter(blacklist, (element) => !element.blacklist);

        _.each(blacklist, (element) => { element.weight = 0; });
        if (selected.length) _.each(selected, (element) => { element.weight = total / selected.length; });

        return blacklist;
    },
    generateBlacklist = (blacklist, columns, rows) => {
        if (!blacklist) return;

        for (let x = columns.first; x < columns.last; x++) for (let y = rows.first; y < rows.last; y++) {
            blacklist.push({ x, y, blacklist: true, weight: 1 });
        }

        return blacklist;
    },
    generateCombinations = (element, n, ratio, trial) => {
        /** Creates a new Map for each stage i to comprehensively track the properties of multiple elements
        *  (i.e. to determine whether a vertical gratings stimulus has already been shown): */
        const map = new Map();

        /** Filters out all elements w/ variables needing probability distributions: */
        if (element.variables?.length > 0) {
            let list = [];

            _.each(element.variables, (variable) => {
                const path = variable.split('.');
                let v = _.get(element, path);

                /** Do not use dependent variables in combinatorial calculations: */
                if (_.has(v, 'depends')) return;

                const multiply = (a, item) => ((_.isArray(v) && v.length > 0)
                    ? _.each(v, (o) => a.push(updatePath(path, o, item)))
                    : a.push(updatePath(path, v, item)));

                /** Temporary adjustment for schema version compatibility: */
                if (_.last(path) === 'location') v = _.filter(element.grid.blacklist, (location) => !location.blacklist);

                /** If other variables have already been added to the combinations list,
                 *  multiply/cross the previous variables w/ the current variable: */
                if (list.length > 0) {
                    const temp = []; //TODO: Use update or _.map to condense?

                    /** Add next variable values to each outcome listed: */
                    _.each(list, (item) => multiply(temp, item));

                    list = temp;
                } else {
                    multiply(list, element);
                }
            });

            if (list.length > 0) {
                /** Adds count for each combination of element j's variables to the stage i Map: */
                _.each(list, (item) => map.set(item, 0));

                generateDistribution(element, map, n, ratio, trial, list);

                /** Shuffle using Fisher-Yates method to randomize order of weighted distribution: */
                return update(trial, { $set: _.shuffle(trial) });
            }
        }

        _.times(n, () => trial.push(element));
        return trial;
    },
    generateDistribution = (element, map, n, ratio, trial, list) => {
        const size = (map.size / 2),
            weights = element.weights ? getWeights(element, list) : (ratio // Given 'ratio', assumes binary condition
                ? _.flatten(_.times(size, () => ([ ratio / size, parseFloat(((1 - ratio) / size).toFixed(5)) ])))
                : _.flatten(_.times(map.size, () => ([ 1 / map.size ])))), // Equal probability for all outcomes
            portion = (w) => Math.floor(n * w),
            portions = _.map(weights, (w) => portion(w)),
            sum = _.reduce(portions, (memo, p) => memo + p),
            /** If stimuli combinations cannot be distributed evenly across an uneven number of trials,
             *  add an additional trial to the last combination generated: */
            repeats = _.map(weights, (w, i) => (i < weights.length - 1 || sum === n) ? portion(w) : portion(w) + Math.floor(n - sum));

        _.each(repeats, (r, k) => _.times(r, () => {
            trial.push(_.defaults(list[ k ], element)); // TODO: Push w/o defaults & use base under session.elements for defaults @ trial lvl
            map.set(list[ k ], map.get(list[ k ]) + 1);
        }));
    },
    generateVisuals = (visuals, first, last) => {
        const columns = 3, rows = 3;

        for (let i = first; i < last; i++) {
            const previous = (visuals[ first - 1 ]) ? visuals[ first - 1 ] : {
                bars: 3,
                contrast: 1,
                delay: 0,
                duration: 5000,
                grid: {
                    blacklist: generateBlacklist([],
                        { first: 1, last: columns + 1 },
                        { first: 1, last: rows + 1 }),
                    weighted: false,
                    x: 3,
                    y: 3
                },
                spacing: 1,
                span: 100,
                variables: [ 'grid.blacklist' ],
                weight: 20
            };

            visuals.push(previous);
        }

        return visuals;
    },
    getWeights = (element, list) => _.map(list, (combo) => _.reduce(_.map(element.variables, (variable, v) => {
        const path = variable.split('.'),
            values = _.get(element, path); // Get list of potential variable values

        /** Do not use dependent variables in combinatorial calculations: */
        if (_.has(values, 'depends')) return;

        const match = _.get(combo, path), // Match this outcome's value in values
            i = _.findIndex(values, (value) => (value === match));

        return element.weights ? element.weights[ v ][ i ] : 1 / list.length; // Grab index of value
    }), (mem, w) => (w ? mem * w : mem))), // Multiply weights from each combo
    randomLocation = (width, height, locations) => {
        const x = _.random(1, width),
            y = _.random(1, height),
            location = { x: x, y: y },
            key = JSON.stringify(location);

        return (!locations.get(key)) ? location : randomLocation(width, height, locations);
    },
    updatePath = (path, value, obj) => {
        const parent = _.initial(path),
            up = update((parent.length > 0)
                ? _.get(obj, parent)
                : obj, { [ _.last(path) ]: { $set: value } });

        return parent.length > 0 ? updatePath(parent, up, obj) : up;
    };

Meteor.methods({
    /**
     * calculateCenter
     *
     * Description:
     *  Halves given dimensions to determine center-point of object or page
     *
     * Parameters:
     *  height - span returned as y-coordinate
     *  width - span returned as x-coordinate
     *
     * Returns:
     *  Object {x: Integer, y: Integer} */
    'calculateCenter': (height, width) => ({ x: Math.floor(width / 2), y: Math.floor(height / 2) }),
    /**
     * generateTrials
     *
     * Description:
     *  Creates an array of trials randomly generated and assorted to cover a requested set of parameters
     *
     * Parameters:
     *  session -
     *  stages -
     *
     * Returns:
     *  Array {} */
    'generateTrials': (session, stages) => {
        // TODO: Find way to generate "add on" stimuli with session parameters
        let trials = [];

        /** Returns an integer representing the estimated number of trials which will occur in the Session.
         *  If the Session duration is given in terms of the total number of ms, the total ms are divided by
         *  the ms duration of the ITI, which represents the total length of a trial, including any delay periods. */
        const n = calculateTotal(session);

        /** Performs calculations for every stage of a given template, iterating over stages instead of trials
         *  in order to generate holistic probability distributions across a trial set: */
        _.each(stages, (stage, i) => {
            /** (1) First, adds an empty array for stage i to the trials array */
            trials.push([]);

            /** Performs calculations for every element within a given stage (i.e. fixation cross),
             *  generating combinations based on each element's specified variables: */
            _.each(stage, (element, j) => {
                /** (2) Next, adds an empty array for element j to stage i on the trials array */
                trials[ i ].push([]);

                /** (3) Generates probability distributions for element j relative to specified variables: */
                trials[ i ][ j ] = generateCombinations(element, n, session.distribution?.ratio,
                    trials[ i ][ j ]);
            });
        });

        const getIndependent = (type, number, stage = 0) => _.find(trials[ stage ], (elements, k) =>
            (type === elements[ k ].type && Number(number) === elements[ k ].number - 1))
            ?? (stage + 1 < trials.length ? getIndependent(type, number, stage + 1) : null);

        _.each(stages, (stage, i) => {
            _.each(stage, (element, j) => {
                _.each(element.variables, (v) => {
                    const path = v.split('.'),
                        variable = _.get(element, path);

                    if (!variable.depends) return;

                    const depends = variable.depends.split('.');

                    if (depends.length > 1) {
                        const target = getIndependent(depends[ 0 ], depends[ 1 ]);

                        /** Cease post-processing if no matching independents found: */
                        if (!target) return;

                        /** Update dependent variable(s) to match corresponding independent variable(s): */
                        trials = update(trials, { [ i ]: { [ j ]: {
                            $set: _.map(trials[ i ][ j ], (e, k) => {
                                    /** Get value of independent variable: */
                                    const val = _.get(target[ k ], _.rest(depends, 2));
                                    /** Update dependent variable w/ match function: */
                                    return (variable.match) ? updatePath(path, variable.match[ val ], e) : e;
                                } )
                        } } });
                    }
                });
            });
        });

        /** Consolidates arrays of distributed elements of stage i into a single stage i item for the trials array: */
        _.each(stages, (_stage, i) => { trials = update(trials, { [ i ]: { $set: _.zip(...trials[ i ]) } }); });

        /** Consolidates arrays of distributed stages into a single trials array for Sessions: */
        return _.zip(...trials);
    }
});
