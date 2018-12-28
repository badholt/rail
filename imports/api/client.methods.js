import _ from 'underscore';

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
                variables: ['grid'],
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
        console.log(entries);
        const i = _.random(0, entries.length - 1),
            entry = entries[i],
            key = JSON.parse(entry[0]),
            value = entry[1],
            r = _.random(0, 100) / 100;
        console.log(i, key, value, r);

        return (r < value) ? key : randomEntry(entries);
    };

Meteor.methods({
    'calculateCenter': (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    'generateSettings': (stimuli, trials) => {
        // TODO: Enable more settings & stages customization
        // Settings currently hard-codes the first stage (cross),
        // but eventually settings will include customizable stages
        const stage = 1;
        let stages = [[{
                bars: {span: 300, weight: 10},
                cross: {span: 75, weight: 5}
            }], []],
            settings = [];

        /** Add settings for each stimulus within a stage: */
        stimuli.visuals.forEach((value, index) => {
            stages[stage].push({
                bars: value.bars,
                correct: _.filter(trials.correct, (condition) => condition.stimulus === index),
                delay: value.delay,
                duration: value.duration,
                frequency: value.frequency,
                grid: {
                    blacklist: _.map(_.filter(value.grid.blacklist, (element) => !element.blacklist),
                        (element) => [JSON.stringify({x: element.x, y: element.y}), element.weight]),
                    x: value.grid.x, y: value.grid.y
                },
                iti: trials.iti,
                light: trials.light,
                map: [],
                opacity: value.contrast,
                spacing: value.spacing,
                span: value.span,
                variables: value.variables,
                weight: value.weight
            });
        });

        for (let i = 0; i < trials.total; i++) settings.push(stages);
        return settings;
    },
    'generateStimuli': (session, trial, settings, stage) => {
        let locations = new Map(),
            orientation = Math.random() > 0.5 ? 0 : 90,
            stimuli = [],
            visuals = settings[stage];

        // TODO: Coupled orientations
        for (let i = 0; i < visuals.length; i++) {
            const stimulus = visuals[i],
                span = stimulus.span,
                variable = _.contains(stimulus.variables, 'grid'),
                weight = stimulus.weight;
            let location = JSON.parse(stimulus.grid.blacklist[0][0]);

            if (variable) {
                const previous = new Map(stimulus.map),
                    merge = new Map([...stimulus.grid.blacklist, ...locations, ...stimulus.map]),
                    unused = _.filter([...merge], (element) => element[1]);
                let map = [];

                location = randomEntry(unused);

                if (unused.length > 1) {
                    previous.set(JSON.stringify(location), 0);
                    map = [...previous.entries()];
                } else {
                    // const curve = _.first(settings, trial + 1);
                    // console.log('reset', curve);
                }

                Meteor.call('updateSession', session,
                    'settings.$[].' + stage + '.' + i + '.map', map);
            }

            stimuli.push({
                bars: stimulus.bars,
                delay: stimulus.delay,
                duration: stimulus.duration,
                frequency: stimulus.frequency,
                grid: stimulus.grid,
                height: (orientation === 0) ? weight : span,
                light: stimulus.light,
                location: location,
                opacity: stimulus.opacity,
                orientation: {value: orientation, units: 'deg'},
                spacing: stimulus.spacing,
                width: (orientation === 0) ? span : weight
            });

            /** Prevent multiple stimuli from appearing at the same location:  */
            locations.set(JSON.stringify(location), 0);
            /** Prevent pairs of stimuli from sharing the same orientation: */
            orientation = 90 - orientation;
        }
        return stimuli;
    }
});
