import './stimuli.html';

import _ from "underscore";
import update from 'immutability-helper';

import {calculateCenter, calculateWeights, generateBlacklist, generateVisuals} from '../../../api/client.methods';
import {Template} from 'meteor/templating';
import {Trials} from "../../../api/collections";

Template.stimuliForm.helpers({
    stimuli(index) {
        return _.extend(this, {index: index, order: index + 1});
    }
});

Template.stimulusForm.events({
    'click i.trophy.icon'(event, template) {
        const session = template.parent(3),
            trials = session.trials.get();

        _.each(trials.correct, (condition) => condition.stimulus = this.index);
        session.trials.set(trials);
    },
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            console.log(template, template.parent(3));
            const session = template.parent(3),
                page = session.page.get(),
                stages = session.stages.get(),
                stage = stages[page][this.index];
            let grid;

            switch (target.name) {
                case 'bars':
                case 'contrast':
                case 'delay':
                case 'duration':
                case 'frequency':
                case 'min':
                case 'spacing':
                case 'span':
                case 'step':
                case 'weight':
                    stage[target.name] = value;
                    session.stages.set(stages);
                    break;
                case 'grid-x':
                    grid = stage.grid;
                    grid.blacklist = (value > grid.x)
                        ? generateBlacklist(grid.blacklist,
                            {first: grid.x + 1, last: value + 1},
                            {first: 1, last: grid.y + 1})
                        : _.reject(grid.blacklist, _.matches({x: grid.x}));
                    grid.x = value;
                    session.stages.set(stages);
                    break;
                case 'grid-y':
                    grid = stage.grid;
                    grid.blacklist = (value > grid.y)
                        ? generateBlacklist(grid.blacklist,
                            {first: 1, last: grid.x + 1},
                            {first: grid.y + 1, last: value + 1})
                        : _.reject(grid.blacklist, _.matches({y: grid.y}));
                    grid.y = value;
                    session.stages.set(stages);
                    break;
                case 'number':
                    session[target.name] = value;
                    const values = (value < stages[page].length)
                        ? _.first(stages[page], value)
                        : generateVisuals(stages[page], stages[page].length, value);

                    stages[page] = values;
                    session.stages.set(stages);
                    break;
            }
        }
    },
});

Template.stimulusForm.helpers({
    attend(index) {
        // const session = Template.instance().parent(3),
        //     trials = session.trials.get();
        //
        // return _.some(trials.correct, (condition) => condition.stimulus === index);
    },
    checked(field) {
        return _.contains(this.variables, field);
    },
    weighted() {
        return this.grid.weighted;
    }
});

Template.stimulusForm.onRendered(function () {
    let template = Template.instance().parent(3);
    console.log(template);

    $('.ui.checkbox').checkbox({
        onChecked: function () {
            const id = this.getAttribute('id').split('-'),
                type = id[0],
                field = id[1],
                index = id[2] - 1,
                page = template.page.get(),
                stages = template.stages.get(),
                stimulus = stages[page][index];

            if (type === 'dynamic') {
                const variables = stimulus.variables;

                stimulus.variables = _.union(variables, [field]);
            } else if (type === 'weighted') {
                const blacklist = stimulus.grid.blacklist;
                stimulus.grid.weighted = true;

                calculateWeights(blacklist, 1);
                $('#dynamic-grid-' + id[2]).parent().checkbox('check');
            }

            template.stages.set(stages);
        },
        onUnchecked: function () {
            const id = this.getAttribute('id').split('-'),
                type = id[0],
                field = id[1],
                index = id[2] - 1,
                page = template.page.get(),
                stages = template.stages.get(),
                stimulus = stages[page][index];


            if (type === 'dynamic') {
                const variables = stimulus.variables;
                stimulus.variables = _.without(variables, field);

                if (field === 'grid') {
                    const blacklist = stimulus.grid.blacklist;
                    _.each(blacklist, (element) => element.blacklist = true);
                    $('#weighted-grid-' + id[2]).parent().checkbox('uncheck');
                }
            } else if (type === 'weighted') {
                const blacklist = stimulus.grid.blacklist;

                _.each(blacklist, (element) => element.weight = 1);
                stimulus.grid.weighted = false;
            }

            template.stages.set(stages);
        }
    });
});

Template.stimulusPreview.helpers({
    stimulus() {
        if (Template.instance().rendered.get()) {
            const container = $('svg.stimulus-preview'),
                height = container.height(),
                width = container.width(),
                orientation = (this.orientation) ? this.orientation[0] : {units: 'deg', value: 0};

            if (height && width) return {
                center: _.mapObject(calculateCenter(height, width), (value)=> value * 2),
                data: update(this, {orientation: {$set: orientation}})
            };

            Template.instance().rendered.set(false);
        } else {
            Template.instance().rendered.set(true);
        }
    }
});

Template.stimulusPreview.onCreated(function () {
    this.autorun(() => {
        this.getDimensions = () => {
            const container = $('svg.stimulus-preview'),
                height = container.height(),
                width = container.width();

            console.log(container, height, width);
        }

    });

    this.rendered = new ReactiveVar(false);
});

Template.stimulusPreview.onRendered(function () {
    Template.instance().getDimensions();
    Template.instance().rendered.set(true);
});
