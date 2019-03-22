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
    randomEntry = (entries) => {
        const i = _.random(0, entries.length - 1),
            entry = entries[i],
            value = entry[1],
            r = _.random(0, 100) / 100;

        return (r < value) ? entry : randomEntry(entries);
    };

Meteor.methods({
    'calculateCenter': (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    'generateTrials': (form) => {
        // TODO: Find way to generate "add on" stimuli with session parameters
        let trials = [];

        _.each(form.stages, (stage, i) => {
            const combinations = new Map();
            trials.push([]);

            _.each(stage, (element, j) => {
                trials[i].push([]);

                if (element.type === 'stimuli') {
                    let stimuli = [];

                    _.each(element.variables, (variable) => {
                        /** TODO: For other variables, we could generate arrays of possible
                         *  values comparable to the blacklist here (i.e. [0, 0.25, 0.5, 0.75, 1] for contrast)
                         */
                        const options = (variable !== 'location') ? element[variable]
                            : _.filter(element.grid.blacklist, (location) => !location.blacklist),
                            nOptions = _.size(options),
                            nStimuli = _.size(stimuli);

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

                    _.each(stimuli, (element) => combinations.set(element, element.location.weight));
                }

                const n = (form.session.duration)
                    ? Math.round(form.session.duration / form.session.iti) * 6
                    : form.session.total;
                let map = [...combinations.entries()];

                _.times(n, () => {
                    if (map.length > 0) {
                        const random = randomEntry(map);

                        trials[i][j].push(_.defaults(random[0], element));
                        map = (map.length > 1) ? _.without(map, random) : [...combinations.entries()];
                    } else {
                        trials[i][j].push(element);
                    }
                });
            });

            trials = update(trials, {[i]: {$set: _.zip(...trials[i])}});
        });

        return _.zip(...trials);
    }
});
