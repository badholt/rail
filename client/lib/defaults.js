import {Session} from 'meteor/session';

let defaults = {
    stage: 1,
    stages: [{data: [], visuals: []}, {data: [], visuals: []}],
    stimuli: 2,
    total: 5,
    trial: 1,
};

for (let i = 0; i < defaults.stimuli; i++) {
    defaults.stages[1].visuals.push({
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

_.each(defaults, function (value, key) {
    Session.setDefault(key, value);
});

Session.restoreDefault = function (key) {
    Session.set(key, defaults[key]);
};
