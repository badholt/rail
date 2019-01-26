import '/imports/api/server.methods';

import {Meteor} from 'meteor/meteor';
import {Templates} from '/imports/api/collections';

Meteor.startup(() => {
    if (Templates.find().count() === 0) {
        const templates = [
            {
                author: 'default bars',
                devices: 'any',
                name: 'Gratings',
                number: 1,
                session: {
                    correct: [{event: 'left', orientation: {value: 90, units: 'deg'}, stimulus: 0},
                        {event: 'right', orientation: {value: 0, units: 'deg'}, stimulus: 0}],
                    delay: 0,
                    duration: 300000,
                    iti: 10000,
                    light: {
                        delay: 0,
                        dim: 50,
                        duration: 3000
                    },
                    reward: {
                        delay: 0,
                        duration: 1000
                    },
                    total: 5
                },
                stages: [
                    [
                        {
                            type: 'cross',
                            span: 75,
                            weight: 5
                        }
                    ],
                    [
                        {
                            type: 'stimuli',
                            bars: 3,
                            contrast: 1,
                            delay: 0,
                            duration: 5000,
                            frequency: 4,
                            grid: {
                                blacklist: [
                                    {
                                        x: 1,
                                        y: 1,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 1,
                                        y: 2,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 1,
                                        y: 3,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 2,
                                        y: 1,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 2,
                                        y: 2,
                                        blacklist: false,
                                        weight: 1
                                    },
                                    {
                                        x: 2,
                                        y: 3,
                                        blacklist: false,
                                        weight: 1
                                    },
                                    {
                                        x: 3,
                                        y: 1,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 3,
                                        y: 2,
                                        blacklist: true,
                                        weight: 1
                                    },
                                    {
                                        x: 3,
                                        y: 3,
                                        blacklist: true,
                                        weight: 1
                                    }
                                ],
                                weighted: false,
                                x: 3,
                                y: 3
                            },
                            location: {x: 1, y: 1},
                            number: 1,
                            orientation: [
                                {
                                    units: 'deg',
                                    value: 0
                                },
                                {
                                    units: 'deg',
                                    value: 90
                                }
                            ],
                            spacing: 2,
                            span: 100,
                            variables: ['location', 'orientation'],
                            weight: 5
                        }
                    ]
                ],
                users: 'any'
            },
            {
                author: 'default bell',
                devices: 'any',
                name: 'Shaping',
                number: 0, //TODO Make variable (here) obsolete
                session: {
                    delay: 30000,
                    duration: 300000,
                    iti: 11000,
                    total: 5
                }, // TODO Might need Stage settings (i.e. individual duration/iti for each stage)
                stages: [
                    [
                        {
                            type: 'audio',
                            delay: 0,
                            duration: 1000,
                            file: {
                                name: 'Beep',
                                source: '/audio/beep.wav',
                                type: 'wav'
                            },
                            loop: 'loop'
                        },
                        {
                            type: 'light',
                            commands: [
                                {
                                    command: 'dim',
                                    delay: 0,
                                    dim: 10
                                },
                                {
                                    command: 'on',
                                    delay: 0,
                                    numbers: [1]
                                },
                                {
                                    command: 'off',
                                    delay: 10000,
                                    numbers: [1]
                                }
                            ],
                            delay: 1000,
                            dim: 10,
                            duration: 10000
                        },
                        {
                            type: 'reward',
                            commands: [
                                {
                                    command: 'on',
                                    delay: 0
                                },
                                {
                                    command: 'off',
                                    delay: 1000
                                }
                            ],
                            delay: 1000,
                            duration: 1000
                        }
                    ]
                ],
                users: 'any'
            }
        ];

        _.each(templates, (template) => Meteor.call('addTemplate', template));
    }
});
