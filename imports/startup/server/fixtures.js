import '/imports/api/server.methods';

import {Meteor} from 'meteor/meteor';
import {Templates} from '/imports/api/collections';

Meteor.startup(() => {
    process.env.ROOT_URL = 'http://redirect.railpage.org';

    if (Templates.find().count() === 0) {
        const templates = [
            {
                author: '',
                devices: 'any',
                icon: 'default bars',
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
                                            source: {
                                                wave: {
                                                    frequency: 600,
                                                    type: 'sine'
                                                },
                                                type: 'wave'
                                            },
                                            loop: 'loop'
                                        },
                                        {
                                            type: 'reward',
                                            commands: [
                                                {
                                                    command: 'dispense',
                                                    amount: 0.025
                                                }
                                            ],
                                            delay: 0,
                                            duration: 1 / 15
                                        },]
                                },
                                {
                                    action: '+',
                                    delay: 5000,
                                    specifications: {amount: 1},
                                    targets: ['trial']
                                }
                            ],
                            event: 'click',
                            incorrect: []
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
                                            source: {
                                                wave: {
                                                    frequency: 600,
                                                    type: 'sine'
                                                },
                                                type: 'wave'
                                            },
                                            loop: 'loop'
                                        },
                                        {
                                            type: 'reward',
                                            commands: [
                                                {
                                                    command: 'dispense',
                                                    amount: 0.025
                                                }
                                            ],
                                            delay: 0,
                                            duration: 1 / 15
                                        },]
                                },
                                {
                                    action: '+',
                                    delay: 5000,
                                    specifications: {amount: 1},
                                    targets: ['trial']
                                }
                            ],
                            event: 'click',
                            incorrect: []
                        },
                    ]
                ],
                name: 'Shaping IV',
                number: 1,
                session: {
                    delay: 0,
                    duration: 300000,
                    iti: 10000,
                    total: 0
                },
                stages: [
                    [
                        {
                            delay: 0,
                            duration: 9500,
                            offset: {
                                x: 0,
                                y: 0.85
                            },
                            type: 'cross',
                            span: 60,
                            weight: 12
                        }
                    ],
                    [
                        {
                            type: 'stimuli',
                            bars: 3,
                            contrast: 1,
                            delay: 0,
                            duration: 60000,
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
                                        blacklist: true,
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
                            span: 108,
                            variables: ['location', 'orientation'],
                            weight: 12
                        }
                    ]
                ],
                users: ['any']
            },
            {
                author: '',
                devices: 'any',
                icon: 'default bell',
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
                                            pins: [1]
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
                                delay: 20000,
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
                            delay: 0,
                            duration: 1000,
                            offset: {
                                x: 0,
                                y: 0.85
                            },
                            type: 'cross',
                            span: 75,
                            weight: 10
                        },
                        {
                            type: 'audio',
                            delay: 0,
                            duration: 1000,
                            source: {
                                wave: {
                                    frequency: 600,
                                    type: 'sine'
                                },
                                type: 'wave'
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
                                    pins: [2]
                                },
                                {
                                    command: 'on',
                                    delay: 0,
                                    pins: [2]
                                },
                                {
                                    command: 'off',
                                    delay: 10000,
                                    pins: [2]
                                }
                            ],
                            delay: 0,
                            dim: 10,
                            duration: 10000
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
                users: ['any']
            },
            {
                author: '',
                devices: 'any',
                icon: 'default bell',
                inputs: [
                    [
                        {
                            conditions: [
                                {
                                    comparison: '<',
                                    objects: [
                                        {
                                            name: 'number',
                                            property: 400
                                        }
                                    ],
                                    subjects: [
                                        {
                                            name: 'event',
                                            property: 'clientY'
                                        }
                                    ]
                                },
                                {
                                    comparison: '<',
                                    objects: [
                                        {
                                            name: 'event',
                                            property: 'clientY'
                                        }
                                    ],
                                    subjects: [
                                        {
                                            name: 'number',
                                            property: 470
                                        }
                                    ]
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
                                            source: {
                                                wave: {
                                                    frequency: 600,
                                                    type: 'sine'
                                                },
                                                type: 'wave'
                                            },
                                            loop: 'loop'
                                        },
                                        {
                                            type: 'reward',
                                            commands: [
                                                {
                                                    command: 'dispense',
                                                    amount: 0.025
                                                }
                                            ],
                                            delay: 0,
                                            duration: 1 / 15
                                        },
                                        {
                                            type: 'lights',
                                            commands: [
                                                {
                                                    command: 'on',
                                                    delay: 0,
                                                    pins: [
                                                        3
                                                    ]
                                                },
                                                {
                                                    command: 'off',
                                                    delay: 2500,
                                                    pins: [
                                                        3
                                                    ]
                                                }
                                            ],
                                            delay: 0,
                                            dim: 10,
                                            duration: 2500
                                        }
                                    ]
                                },
                                {
                                    action: '+',
                                    specifications: {
                                        amount: 1
                                    },
                                    delay: 5000,
                                    targets: [
                                        'trial'
                                    ]
                                }
                            ],
                            event: 'click',
                            incorrect: []
                        }
                    ]
                ],
                name: 'Shaping II',
                number: 1,
                session: {
                    delay: 0,
                    duration: 1800000,
                    iti: 30000,
                    total: 0
                },
                stages: [
                    [
                        {
                            delay: 0,
                            duration: 1000,
                            offset: {
                                x: 0,
                                y: 0.85
                            },
                            type: 'cross',
                            span: 60,
                            weight: 12
                        },
                        {
                            type: 'audio',
                            delay: 0,
                            duration: 30,
                            source: {
                                wave: {
                                    frequency: 600,
                                    type: 'sine'
                                },
                                type: 'wave'
                            },
                            loop: 'loop'
                        }
                    ]
                ],
                users: ['any']
            }
        ];

        _.each(templates, (template) => Meteor.call('addTemplate', template));
    }
});
