/**
 * api/client.methods.js
 *
 * Description:
 *  Defines client-side methods for secure access to the database and methods for general use throughout the application
 *
 * Imports:
 *  UnderscoreJS - extends JavaScript language capabilities
 *  Immutability Helper - enables modification of retrieved data without modifying the original source */
import _ from 'underscore';
import update from 'immutability-helper';

import { Meteor } from 'meteor/meteor';

export const calculateCenter = (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    calculateTotal = (session) => (session.duration) ? Math.round(session.duration / session.iti * session.distribution.multiplier) : session.total,
    calculateWeights = (blacklist, total) => {
        const selected = _.filter(blacklist, (element) => !element.blacklist);

        _.each(blacklist, (element) => element.weight = 0);
        if (selected.length) _.each(selected, (element) => element.weight = total / selected.length);

        return blacklist;
    },
    generateBlacklist = (blacklist, columns, rows) => {
        for (let x = columns.first; x < columns.last; x++) for (let y = rows.first; y < rows.last; y++) {
            blacklist.push({
                x: x,
                y: y,
                blacklist: true,
                weight: 1
            });
        }
        return blacklist;
    },
    generateCombinations = (element, n, ratio, trial) => {
        /** Creates a new Map for each stage i to comprehensively track the properties of multiple elements
        *  (i.e. to determine whether a vertical gratings stimulus has already been shown): */
        const map = new Map();

        /** Filters out all elements w/ variables needing probability distributions: */
        if (element.variables && element.variables.length > 0) {
            let list = [],
            // base = _.omit(element, 'variables', ...element.variables), // TODO: Add base defaults as session.elements
            variables = _.pick(element, ...element.variables);
            
            _.each(variables, (v, key) => {
                const multiply = (a, item) => ((_.isArray(v) && v.length > 0)
                        ? _.each(v, (o) => a.push(_.extend({[key]: o}, item)))
                        : a.push(_.extend({[key]: v}, item)));

                /** Temporary adjustment for schema version compatibility: */
                if (key === 'location') v = _.filter(element.grid.blacklist, (location) => !location.blacklist);

                /** If other variables have already been added to the combinations list,
                 *  multiply/cross the previous variables w/ the current variable: */
                if (list.length > 0) {
                    let temp = [];

                    _.each(list, (item) => multiply(temp, item));
                    list = temp;
                } else {
                    multiply(list, {});
                }
            });

            /** Adds count for each combination of element j's variables to the stage i Map: */
            _.each(list, (item) => map.set(item, 0));

            generateDistribution(element, map, n, ratio, trial, list);

            /** Shuffle using Fisher-Yates method to randomize order of weighted distribution: */
            trial = update(trial, {$set: _.shuffle(trial)});
        } else {
            _.times(n, () => trial.push(element));
        }

        return trial;
    },
    generateDistribution = (element, map, n, ratio, trial, list) => {
        /** METHOD 1 - Weighted probabilities for (global) stages generation: */
        // _.times(n, () => {
        //     const weights = [0.25 * n, n], // DUMMY VARS
        //     r = _.random(n),
        //     rI = Math.floor(_.findIndex(weights, (w) => (r <= w))),
        //     random = list[rI],
        //     count = map.get(random);

        //     trial.push(_.defaults(random, element));
        //     map.set(random, count + 1);
        // });

        /** METHOD 2 - Probability distribution of stages w/ exact global weights: */
        const weights = [ ratio, parseFloat((1 - ratio).toFixed(5)) ], // DUMMY VARS
            portion = (w) => Math.floor(n * w),
            portions = _.map(weights, (w) => portion(w)),
            sum = _.reduce(portions, (memo, p) => memo + p),
            /** If stimuli combinations cannot be distributed evenly across an uneven number of trials,
             *  add an additional trial to the last combination generated: */
            repeats = _.map(weights, (w, i) => (i < weights.length - 1 || sum === n) ? portion(w) : portion(w) + Math.floor(n - sum));

        _.each(repeats, (r, k) => _.times(r, () => {
            trial.push(_.defaults(list[k], element)); // TODO: Push w/o defaults & use base under session.elements for defaults @ trial lvl
            map.set(list[k], map.get(list[k]) + 1);
        }));

        // PRINT
        console.log("PORTIONS:\t", portions);
        console.log("COUNTS:\t", map.entries());
    },
    generateVisuals = (visuals, first, last) => {
        const columns = 3, rows = 3;

        for (let i = first; i < last; i++) {
            let previous = (visuals[first - 1]) ? visuals[first - 1] : {
                bars: 3,
                contrast: 1,
                delay: 0,
                duration: 5000,
                grid: {
                    blacklist: generateBlacklist([],
                        {first: 1, last: columns + 1},
                        {first: 1, last: rows + 1}),
                    weighted: false,
                    x: 3,
                    y: 3
                },
                spacing: 1,
                span: 100,
                variables: ['grid.blacklist'],
                weight: 20
            };

            visuals.push(previous);
        }

        return visuals;
    },
    randomLocation = (width, height, locations) => {
        const x = _.random(1, width),
            y = _.random(1, height),
            location = {x: x, y: y},
            key = JSON.stringify(location);

        return (!locations.get(key)) ? location : randomLocation(width, height, locations);
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
    'calculateCenter': (height, width) => ({x: Math.floor(width / 2), y: Math.floor(height / 2)}),
    /**
     * generateTrials
     *
     * Description:
     *  Creates an array of trials randomly generated and assorted to cover a requested set of parameters
     *
     * Parameters:
     *  inputs -
     *  session -
     *  stages -
     *
     * Returns:
     *  Array {} */
    'generateTrials': (inputs, session, stages) => {
        // TODO: Find way to generate "add on" stimuli with session parameters
        let trials = [];

        if (!session.distribution) session.distribution = { multiplier: 1, ratio: 1 };

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
                    trials[ i ][ j ] = generateCombinations(element, n, session.distribution.ratio, trials[ i ][ j ]);



                    _.each(element.variables, (v) => { // TODO: Avoid post-processing?
                        if (_.has(element[ v ], 'dependent')) {
                            const variable = element[ v ],
                                dependent = variable[ 'dependent' ].split('.');

                            if (dependent.length > 1) {
                                let d = _.findIndex(trials[ i ], (elements, k) =>
                                    (j !== k && dependent[ 0 ] === elements[ k ][ 'type' ] && dependent[ 1 ] == elements[ k ][ 'number' ] - 1));

                                if (d > -1) {
                                    const post = _.map(trials[ i ][ j ], (e, k) => {
                                        const property = trials[ i ][ d ][ k ][ dependent[ 2 ] ],
                                            transform = (key, value) => property[ key ] + value;

                                        _.each(variable[ 'transform' ], (value, key) => {
                                            e = update(e, { [ dependent[ 2 ] ]: { $set: { [ key ]:  transform(key, value)} } });
                                        });

                                        return e;
                                    });

                                    trials = update(trials, { [ i ]: { [ j ]: { $set: post } } });
                                }
                            }
                        }
                    });
                });

                /** Consolidates arrays of distributed elements of stage i into a single stage i item for the trials array: */
                trials = update(trials, {[ i ]: {$set: _.zip(...trials[ i ])}});
            });

        /** Consolidates arrays of distributed stages into a single trials array for Sessions: */
        return _.zip(...trials);
    }
});
