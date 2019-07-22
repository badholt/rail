import './input.html';

import {Template} from "meteor/templating";

Template.conditionsDropdown.helpers({
    condition() {
        return [
            {
                comparison: "<",
                objects: [
                    {
                        name: "event",
                        property: "clientX"
                    }
                ],
                subjects: [
                    {
                        name: "center",
                        property: "x"
                    }
                ]
            },
            {
                comparison: "=",
                objects: [
                    {
                        name: "stimuli",
                        property: "0.orientation.value"
                    }
                ],
                subjects: [
                    {
                        name: "number",
                        property: 90
                    }
                ]
            }
        ];
    }
});

Template.conditionsDropdown.onRendered(function () {
    $('.conditions').dropdown();
});

Template.correctDropdown.helpers({
    correct() {
        return [
            {
                action: "+",
                specifications: {
                    amount: 1
                },
                delay: 0,
                targets: [
                    "trial"
                ]
            }
        ];
    }
});

Template.correctDropdown.onRendered(function () {
    $('#correct').dropdown();
});

Template.eventDropdown.helpers({
    event() {
        return [
            {name: 'click', icon: 'mouse pointer'},
            {name: 'infrared', icon: 'wifi'}
        ];
    }
});

Template.eventDropdown.onRendered(function () {
    const data = Template.currentData(),
        events = $('#events');
    console.log(data);

    events.dropdown();

    if (data.event) events.dropdown('set selected', data.event);
});

Template.incorrectDropdown.helpers({
    incorrect() {
        return [
            {
                action: "insert",
                delay: 0,
                targets: [
                    {
                        type: "light",
                        commands: [
                            {
                                command: "dim",
                                delay: 0,
                                dim: 10,
                                numbers: "LED1"
                            },
                            {
                                command: "on",
                                delay: 0,
                                numbers: "LED1"
                            },
                            {
                                command: "off",
                                delay: 9000,
                                numbers: "LED1"
                            }
                        ],
                        delay: 1000,
                        dim: 10,
                        duration: 10000
                    }
                ]
            },
            {
                action: "+",
                delay: 0,
                specifications: {
                    amount: 1
                },
                targets: [
                    trial
                ]
            }
        ];
    }
});

Template.incorrectDropdown.onRendered(function () {
    $('#incorrect').dropdown();
});

Template.inputDropdown.helpers({
    input() {
        return [
            {name: 'click', icon: 'mouse pointer'},
            {name: 'infrared', icon: 'wifi'}
        ];
    }
});

Template.inputDropdown.onRendered(function () {
    const parent = this.parent(2);

    $('#inputs').dropdown({
        on: 'hover',
        onChange: (value) => {
            const inputs = parent.inputs.get(),
                page = parent.page.get();

            inputs[page].push({
                conditions: [],
                correct: [],
                event: value,
                incorrect: []
            });
            parent.inputs.set(inputs);
        }
    });
});
