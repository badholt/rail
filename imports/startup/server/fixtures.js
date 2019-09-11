import '/imports/api/server.methods';

import {Meteor} from 'meteor/meteor';
import {Templates} from '/imports/api/collections';

Meteor.startup(() => {
    process.env.ROOT_URL = 'http://redirect.railpage.org';

    if (Templates.find().count() === 0) {
        const templates = [
            {
                author: 'default bars',
                devices: 'any',
                inputs: [
                    [{
                        conditions: [],
                        correct: [{
                            action: '+',
                            delay: 0,
                            specifications: {amount: 1},
                            targets: ['stage']
                        }],
                        event: 'click',
                        incorrect: []
                    }],
                    [
                        {
                            conditions: [
                                {
                                    comparison: '<',
                                    objects: [{name: 'event', property: 'clientX'}],
                                    subjects: [{name: 'center', property: 'x'}]
                                },
                                {
                                    comparison: '=',
                                    objects: [{name: 'stimuli', property: '0.orientation.value'}],
                                    subjects: [{name: 'number', property: 90}]
                                }
                            ],
                            correct: [
                                {
                                    action: 'insert',
                                    delay: 0,
                                    targets: [
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
                                        }]
                                },
                                {
                                    action: '+',
                                    delay: 0,
                                    specifications: {amount: 1},
                                    targets: ['trial']
                                }
                            ],
                            event: 'click',
                            incorrect: [
                                {
                                    action: 'insert',
                                    delay: 0,
                                    targets: [
                                        {
                                            type: 'lights',
                                            commands: [
                                                {
                                                    command: 'dim',
                                                    delay: 0,
                                                    dim: 10,
                                                    numbers: 'LED1'
                                                },
                                                {
                                                    command: 'on',
                                                    delay: 0,
                                                    numbers: 'LED1'
                                                },
                                                {
                                                    command: 'off',
                                                    delay: 9000,
                                                    numbers: 'LED1'
                                                }
                                            ],
                                            delay: 1000,
                                            dim: 10,
                                            duration: 10000
                                        }
                                    ]
                                },
                                {
                                    action: '+',
                                    delay: 0,
                                    specifications: {amount: 1},
                                    targets: ['trial']
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    comparison: '<',
                                    objects: [{name: 'center', property: 'x'}],
                                    subjects: [{name: 'event', property: 'clientX'}]
                                },
                                {
                                    comparison: '=',
                                    objects: [{name: 'stimuli', property: '0.orientation.value'}],
                                    subjects: [{name: 'number', property: 0}]
                                }
                            ],
                            correct: [
                                {
                                    action: 'insert',
                                    delay: 0,
                                    targets: [
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
                                }
                            ],
                            event: 'click',
                            incorrect: [{
                                action: 'insert',
                                delay: 0,
                                targets: [
                                    {
                                        type: 'lights',
                                        commands: [
                                            {
                                                command: 'dim',
                                                delay: 0,
                                                dim: 10,
                                                numbers: 'LED1'
                                            },
                                            {
                                                command: 'on',
                                                delay: 0,
                                                numbers: 'LED1'
                                            },
                                            {
                                                command: 'off',
                                                delay: 9000,
                                                numbers: 'LED1'
                                            }
                                        ],
                                        delay: 1000,
                                        dim: 10,
                                        duration: 10000
                                    }
                                ]
                            }]
                        },
                    ]
                ],
                name: 'Gratings',
                number: 1,
                session: {
                    delay: 0,
                    duration: 300000,
                    iti: 10000,
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
                inputs: [
                    [{
                        conditions: [],
                        correct: [
                            {
                                action: 'insert',
                                delay: 0,
                                targets: [{
                                    type: 'lights',
                                    commands: [
                                        {
                                            command: 'off',
                                            delay: 0,
                                            pins: 'LED1'
                                        }
                                    ],
                                    delay: 0,
                                    dim: 10,
                                    duration: 0
                                }]
                            },
                            {
                                action: '+',
                                specifications: {amount: 1},
                                delay: 0,
                                targets: ['trial']
                            }],
                        event: 'click',
                        incorrect: []
                    }]
                ],
                name: 'Shaping I',
                number: 0, //TODO Make variable (here) obsolete
                session: {
                    delay: 180000,
                    duration: 1800000,
                    iti: 30000,
                    total: 0
                }, // TODO Might need Stage settings (i.e. individual duration/iti for each stage)
                stages: [
                    [
                        {
                            type: 'audio',
                            delay: 20000,
                            duration: 1000,
                            wave: {
                                frequency: 600,
                                type: 'sine'
                            },
                            loop: 'loop'
                        },
                        {
                            type: 'lights',
                            commands: [
                                {








































































































































                                    command: 'dim',
                                    delay: 0,
                                    dim: 10,
                                    pins: 'LED2'
                                },
                                {
                                    command: 'on',
                                    delay: 20000,
                                    pins: 'LED2'
                                },
                                {
                                    command: 'off',
                                    delay: 30000,
                                    pins: 'LED2'
                                }
                            ],
                            delay: 0,
                            dim: 10,
                            duration: 50000
                        },
                        {
                            type: 'reward',
                            commands: [
                                {
                                    command: 'dispense',
                                    amount: 0.01
                                }
                            ],
                            delay: 0,
                            duration: (1 / 15)
                        }
                    ]
                ],
                users: 'any'
            }
        ];

        _.each(templates, (template) => Meteor.call('addTemplate', template));
    }
});
