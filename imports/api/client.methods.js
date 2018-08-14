import _ from 'underscore';

import {Meteor} from 'meteor/meteor';

export const calculateCenter = (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    randomLocation = (width, height, locations) => {
        const x = _.random(1, width),
            y = _.random(1, height),
            location = {x: x, y: y},
            key = JSON.stringify(location);
        return !(locations.get(key)) ? location : randomLocation(width, height, locations);
    },
    randomIndex = (values) => {
        return values[_.random(0, values.length - 1)];
    };

Meteor.methods({
    'calculateCenter': (height, width) => ({
        x: Math.floor(width / 2),
        y: Math.floor(height / 2)
    }),
    'generateSettings': (length, stimuli) => {
        // TODO: Enable more settings & stages customization
        // Settings currently hard-codes the first stage (cross),
        // but eventually settings will include customizable stages
        let stages = [[{
                bars: {span: 300, weight: 10},
                cross: {span: 75, weight: 5}
            }], []],
            settings = [];

        /** Add settings for each stimulus within a stage: */
        stimuli.visuals.forEach((value) => {
            const blacklist = _.map(value.grid.blacklist, (coordinate) => (
                [JSON.stringify({x: coordinate.x, y: coordinate.y}), coordinate.blacklist])
            );
            console.log(blacklist);
            stages[1].push({
                delay: value.delay,
                duration: value.duration,
                grid: {
                    blacklist: blacklist,
                    x: value.grid.x, y: value.grid.y
                },
                map: new Map(blacklist),
                opacity: value.contrast,
                spacing: value.spacing,
                span: value.span,
                weight: value.weight
            });
        });

        for (let i = 0; i < length; i++) settings.push(stages);
        return settings;
    },
    'generateStimuli': (visuals) => {
        let locations = new Map(),
            stimuli = [];

        // TODO: Multiple "whitelists" - one per dynamic variable => Merge maps
        for (let i = 0; i < visuals.length; i++) {
            let orientation = Math.random() > 0.5 ? 0 : 90,
                stimulus = visuals[i],
                location = randomLocation(stimulus.grid.x, stimulus.grid.y, new Map([locations, stimulus.grid.blacklist])),
                span = stimulus.span,
                weight = stimulus.weight;

            stimuli.push({
                grid: stimulus.grid,
                height: (orientation === 0) ? weight : span,
                location: location,
                opacity: stimulus.opacity,
                orientation: {value: orientation, units: 'deg'},
                spacing: stimulus.spacing,
                width: (orientation === 0) ? span : weight
            });

            /** Prevent multiple stimuli from appearing at the same location:  */
            locations.set(JSON.stringify(location), true);
            stimulus.map.set(JSON.stringify(location), true);
        }
        return stimuli;
    }
});
