import './input.html';

import update from 'immutability-helper';

import {Template} from "meteor/templating";

Template.comparisonsDropdown.helpers({
    comparison() {
        return [
            {
                name: '<'
            },
            {
                name: '='
            }
        ];
    }
});

Template.conditionsDropdown.helpers({
    condition() {
        return [
            {
                name: 'event',
                values: ['clientX', 'clientY']
            },
            {
                name: 'center',
                values: ['x', 'y']
            },
            {
                name: 'number'
            },
            {
                name: 'stimuli.0',
                values: ['orientation.value']
            }
        ];
    }
});

Template.conditionsDropdown.onRendered(function () {
    $('.conditions').dropdown({
        allowCategorySelection: true
    });
});

Template.conditionsItem.events({
    'click .condition.item > .left.content > .close'(e, template) {
        const input = template.parent(2).data,
            session = template.parent(5),
            inputs = session.inputs.get();

        session.inputs.set(update(inputs,
            {[input.stage]: {[input.index]: {conditions: {$splice: [[template.data.item, 1]]}}}}));
    }
});

Template.conditionsItem.helpers({
    property() {
        return this.property.toString();
    }
});

Template.correctDropdown.helpers({
    actions() {
        return [{action: "+", targets: ["trial"]}, {action: "insert", targets: []}];
    }
});

Template.correctDropdown.onRendered(function () {
    this.$('.ui.dropdown').dropdown();
});

Template.correctItem.events({
    'click .correct.item > .left.content > .close'(e, template) {
        const input = template.parent(2).data,
            session = template.parent(5),
            inputs = session.inputs.get();

        session.inputs.set(update(inputs,
            {[input.stage]: {[input.index]: {correct: {$splice: [[template.data.item, 1]]}}}}));
    }
});

Template.eventDropdown.helpers({
    events() {
        return [
            {name: 'click', icon: 'mouse pointer'},
            {name: 'infrared', icon: 'wifi'},
            {name: 'pin', icon: 'microchip'}
        ];
    }
});

Template.eventDropdown.onRendered(function () {
    const events = $('.events.dropdown');
    events.dropdown();
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
                    'trial'
                ]
            }
        ];
    }
});

Template.incorrectDropdown.onRendered(function () {
    $('#incorrect').dropdown();
});

Template.incorrectItem.events({
    'click .incorrect.item > .left.content > .close'(e, template) {
        const input = template.parent(2).data,
            session = template.parent(5),
            inputs = session.inputs.get();

        session.inputs.set(update(inputs,
            {[input.stage]: {[input.index]: {incorrect: {$splice: [[template.data.item, 1]]}}}}));
    }
});

Template.inputDropdown.helpers({
    input() {
        return [
            {name: 'click', icon: 'mouse pointer'},
            {name: 'infrared', icon: 'wifi'},
            {name: 'pin', icon: 'microchip'}
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

Template.inputItem.events({
    'click .add-condition'(e, template) {
        const session = template.parent(3),
            inputs = session.inputs.get(),
            values = template.$('.ui.form').form('get values'),
            condition = update(values, {
                objects: {$apply: (value) => ([_.object(['name', 'property'], value.split(','))])},
                subjects: {$apply: (value) => ([_.object(['name', 'property'], value.split(','))])},
            });

        console.log(condition, session);

        session.inputs.set(update(inputs,
            {[template.data.stage]: {[template.data.index]: {conditions: {$push: [condition]}}}}));
    },
    'click .input.item > .right.content > .close'(e, template) {
        const session = template.parent(3),
            inputs = session.inputs.get();

        session.inputs.set(update(inputs, {[template.data.stage]: {$splice: [[template.data.index, 1]]}}));
    }
});

Template.inputList.helpers({
    input(page, inputs) {
        return inputs[page];
    }
});
