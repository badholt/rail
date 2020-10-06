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

import {Meteor} from 'meteor/meteor';

export const calculateCenter = (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
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
    generateVisuals = (visuals, first, last) => {
        const columns = 3, rows = 3;

        for (let i = first; i < last; i++) {
            let previous = (visuals[first - 1]) ? visuals[first - 1] : {
                bars: 3,
                contrast: 1,
                delay: 0,
                duration: 5000,
                frequency: 4,
                grid: {
                    blacklist: generateBlacklist([],
                        {first: 1, last: columns + 1},
                        {first: 1, last: rows + 1}),
                    weighted: false,
                    x: 3,
                    y: 3
                },
                spacing: 2,
                span: 100,
                variables: ['grid.blacklist'],
                weight: 5
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
    },
    /**
     * randomEntry
     *
     * Description:
     *  Returns the value of a randomly-chosen entry in a list
     *
     * Parameters:
     *  entries - an array of key-value pair objects
     *
     * Returns:
     *  Array [Object, Integer]
     * */
    randomEntry = (entries) => {
        /** Retrieves value of randomly-chosen entry i in a list of entries */
        const i = _.random(0, entries.length - 1),
            entry = entries[i],
            value = entry[1],
            r = _.random(0, 100) / 100;

        /** Compares random decimal number to entry i value for extra "shuffling" effect */
        return (r < value) ? entry : randomEntry(entries); //TODO: Verify what this is doing
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

        /** Performs calculations for every stage of a given trial */
        _.each(stages, (stage, i) => {
            /** (1) First, adds an empty array for stage i to the trials array*/
            trials.push([]);
            /** Creates a new Map for each stage i to comprehensively track the properties of multiple elements
             *  (i.e. to determine whether a vertical gratings stimulus has already been shown) */
            const combinations = new Map();

            /** Performs calculations for every element within a given stage (i.e. fixation cross) */
            _.each(stage, (element, j) => {
                /** (2) Next, adds an empty array for element j to stage i on the trials array */
                trials[i].push([]);

                /** (3) Filters out all elements specifying stimuli (i.e. gratings visual) */
                if (element.type === 'stimuli') {
                    let stimuli = [];

                    /** For every parameter of an element */
                    _.each(element.variables, (variable) => {
                        // TODO: For other variables, we could generate arrays of possible values comparable to the blacklist here (i.e. [0, 0.25, 0.5, 0.75, 1] for contrast)
                        /** Totals all parameters other than grid location */
                        const options = (variable !== 'location') ? element[variable]
                            /** Reserves a grid location for the element if viable */
                            : _.filter(element.grid.blacklist, (location) => !location.blacklist),
                            nOptions = _.size(options),
                            nStimuli = _.size(stimuli);

                        /** Checks for multiple stimuli */ //TODO: Explain this
                        if (nStimuli > 0) {
                            const repeats = nOptions / nStimuli;

                            if (repeats >= 1) _.times(Math.round(repeats), () =>
                                stimuli = update(stimuli, {$push: stimuli}));

                            stimuli = _.map(stimuli, (stimulus, n) =>
                                update(stimulus, {[variable]: {$set: options[Math.floor(n / nOptions) % nOptions]}}));
                        } else {
                            _.each(options, (stimulus) =>
                                stimuli = update(stimuli, {$push: [{[variable]: stimulus}]}));
                        }
                    });

                    /** Adds element j to the stage i Map as an entry */
                    //TODO: Current value is a stimuli's (bar) weight. Repurpose this dynamically
                    _.each(stimuli, (element) => combinations.set(element, element.location.weight));
                }

                //TODO: Possibly move this to a calculateDuration function
                /** Calculates Session duration as an integer representing either the number of trials in the Session
                 *  If the Session duration is given in terms of the total number of ms, the total ms are divided by
                 *  the ms duration of the ITI, which represents the total length of a trial, including any delay periods */
                const n = (session.duration) ? Math.round(session.duration / session.iti) * 6 : session.total; //TODO: Why multiply by 6?
                console.log(session.duration, session.iti, session.total, n);

                /** Retrieves a current list of elements in stage i */
                let map = [...combinations.entries()];

                /** Performs calculations for each trial within the Session */
                _.times(n, () => {
                    /** Fills element j with default properties if no elements have yet been added to stage i */
                    if (map.length > 0) {
                        const random = randomEntry(map);

                        trials[i][j].push(_.defaults(random[0], element));

                        //TODO: How could the map ever be longer than 0/modified here?
                        map = (map.length > 1) ? _.without(map, random) : [...combinations.entries()];
                    } else {
                        /** Adds an instance of the default element j to the array of stage i  */
                        trials[i][j].push(element);
                    }
                });
            });

            /** Distributes elements of stage i */
            //trials[i]=stage i --> [element 1, element 2]
            console.log(trials[i]);
            trials = update(trials, {[i]: {$set: _.zip(...trials[i])}});
        });

        /** Distributes stages of Session */
        //[stage 1, stage 2] --->
        console.log(trials);
        return _.zip(...trials);
    }
});
