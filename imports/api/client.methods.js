import {Meteor} from 'meteor/meteor';

export const calculateCenter = (height, width) => ({
    x: Math.floor(width / 2),
    y: Math.floor(height / 2)
}), randomLocation = (width, height, locations) => {
    let x = _.random(1, width),
        y = _.random(1, height),
        location = {x: x, y: y};

    return (locations.get(JSON.stringify(location))) ? randomLocation(width, height, locations) : location;
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
        for (let i = 0; i < stimuli; i++) {
            stages[1].push({
                grid: {
                    blacklist: [
                        [JSON.stringify({x: 1, y: 1}), true],
                        [JSON.stringify({x: 1, y: 2}), true],
                        [JSON.stringify({x: 1, y: 3}), true],
                        [JSON.stringify({x: 2, y: 3}), true],
                        [JSON.stringify({x: 3, y: 1}), true],
                        [JSON.stringify({x: 3, y: 2}), true],
                        [JSON.stringify({x: 3, y: 3}), true],
                    ],
                    x: 3, y: 3
                }, opacity: 1, spacing: 3, span: 300, weight: 10
            });
        }

        for (let i = 0; i < length; i++) settings.push(stages);
        return settings;
    },
    'generateStimuli': visuals => {
        const n = visuals.length,
            locations = new Map(visuals[0]['grid.blacklist']),
            stimuli = [];

        for (let i = 0; i < n; i++) {
            let location = randomLocation(3, 3, locations),
                orientation = Math.random() > 0.5 ? 0 : 90,
                stimulus = visuals[i],
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

            locations.set(JSON.stringify(location), true);
        }

        return stimuli;
    }
});
