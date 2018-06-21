import {Meteor} from 'meteor/meteor';

//import {MqttClient} from 'mqtt';

function randomLocation(width, height, locations) {
    let x = _.random(1, width),
        y = _.random(1, height),
        location = {x: x, y: y};

    return (locations.get(JSON.stringify(location))) ? randomLocation(width, height, locations) : location;
}

Meteor.methods({
    'generateStimuli': function (visuals) {
        console.log('visuals: ', visuals);
        const n = visuals.length,
            locations = new Map(visuals[0]['grid.blacklist']),
            stimuli = [];

        for (let i = 0; i < n; i++) {
            let location = randomLocation(3, 3, locations),
                orientation = Math.random() > 0.5 ? 0 : 90,
                stimulus = visuals[i],
                span = stimulus.span,
                weight = stimulus.weight;
            console.log(orientation, weight, span);

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

        console.log('stimuli: ', stimuli);
        return stimuli;
    }
});
