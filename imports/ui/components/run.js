import './blacklist';
import './run.html';
import './stimulus';

import _ from 'underscore';

import {calculateWeights, generateBlacklist, generateVisuals} from '../../api/client.methods';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

const submitForm = (form) => {
    const devices = $('#device-form .ui.dropdown').dropdown('get value'),
        stimuli = form.stimuli.get(),
        trials = form.trials.get();

    if (devices) _.each(devices, (device) => {
        Meteor.call('generateSettings', stimuli, trials, (error, result) => {
            if (!error) Meteor.call('addSession', device, form.data._id, trials.total, result, (error, session) => {
                if (!error) Meteor.call('addTrial', 1, session);
            });
        });
    });
};

Template.accordion.events({
    'click button'() {
        submitForm(Template.instance());
    },
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            let grid,
                stimuli = template.stimuli.get(),
                trials = template.trials.get();

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
                    stimuli.visuals[this.index][target.name] = value;
                    template.stimuli.set(stimuli);
                    break;
                case 'grid-x':
                    grid = stimuli.visuals[this.index].grid;
                    grid.blacklist = (value > grid.x)
                        ? generateBlacklist(grid.blacklist,
                            {first: grid.x + 1, last: value + 1},
                            {first: 1, last: grid.y + 1})
                        : _.reject(grid.blacklist, _.matches({x: grid.x}));
                    grid.x = value;
                    template.stimuli.set(stimuli);
                    break;
                case 'grid-y':
                    grid = stimuli.visuals[this.index].grid;
                    grid.blacklist = (value > grid.y)
                        ? generateBlacklist(grid.blacklist,
                            {first: 1, last: grid.x + 1},
                            {first: grid.y + 1, last: value + 1})
                        : _.reject(grid.blacklist, _.matches({y: grid.y}));
                    grid.y = value;
                    template.stimuli.set(stimuli);
                    break;
                case 'number':
                    stimuli[target.name] = value;
                    console.log(stimuli, target.name);
                    const visuals = (value < stimuli.visuals.length)
                        ? _.first(stimuli.visuals, value)
                        : generateVisuals(stimuli.visuals, stimuli.visuals.length, value);
                    stimuli.visuals = visuals;
                    console.log(stimuli.visuals);
                    template.stimuli.set(stimuli);
                    break;
                case 'iti':
                case 'light':
                case 'total':
                    trials[target.name] = value;
                    template.trials.set(trials);
                    break;
            }
        }
    },
    'submit .form'(event) {
        event.preventDefault();
        submitForm(Template.instance());
    }
});

Template.accordion.helpers({
    stimuli() {
        return Template.instance().stimuli.get();
    },
    trials() {
        return Template.instance().trials.get();
    }
});

Template.accordion.onCreated(function () {
    let form = this,
        number = 2,
        visuals = generateVisuals([], 0, number);

    form.stimuli = new ReactiveVar({
        number: number,
        visuals: visuals
    });
    form.trials = new ReactiveVar({
        correct: [{event: 'left', orientation: {value: 90, units: 'deg'}, stimulus: 0},
            {event: 'right', orientation: {value: 0, units: 'deg'}, stimulus: 0}],
        iti: 10000,
        light: 3000,
        total: 5
    });

    console.log(this.users);
    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': {$ne: false}}]});
    });
});

Template.accordion.onRendered(function () {
    $('.ui.accordion').accordion({exclusive: false});
});

Template.deviceForm.helpers({
    device() {
        return Meteor.users.find({'profile.device': {$ne: false}});
    }
});

Template.deviceForm.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.stimuliForm.helpers({
    visuals(index) {
        return Template.instance().data.visuals[index];
    }
});

Template.stimulusForm.events({
    'click i.trophy.icon'(event, template) {
        const trials = template.parent(2).trials.get();
        _.each(trials.correct, (condition) => condition.stimulus = this.index);
        template.parent(2).trials.set(trials);
    },
});

Template.stimulusForm.helpers({
    attend(i) {
        const trials = Template.instance().parent(2).trials.get();
        return _.some(trials.correct, (condition) => condition.stimulus === i);
    },
    checked(field) {
        return _.contains(this.visuals.variables, field);
    },
    stimulus() {
        return {
            "bars": this.visuals.bars,
            "frequency": this.visuals.frequency,
            "grid": {
                "x": this.visuals.grid.x,
                "y": this.visuals.grid.y
            },
            "height": this.visuals.span,
            "location": {
                "x": 1,
                "y": this.order
            },
            "opacity": this.visuals.contrast,
            "orientation": {
                "value": 90,
                "units": "deg"
            },
            "preview": true,
            "spacing": this.visuals.spacing,
            "width": this.visuals.weight
        };
    },
    weighted() {
        return this.visuals.grid.weighted;
    }
});

Template.stimulusForm.onRendered(function () {
    let template = Template.instance().parent(2);

    $('.ui.checkbox').checkbox({
        onChecked: function () {
            const id = this.getAttribute('id').split('-'),
                type = id[0],
                field = id[1],
                stimulus = id[2] - 1,
                stimuli = template.stimuli.get();

            if (type === 'dynamic') {
                const variables = stimuli.visuals[stimulus].variables;
                stimuli.visuals[stimulus].variables = _.union(variables, [field]);
            } else if (type === 'weighted') {
                const blacklist = stimuli.visuals[stimulus].grid.blacklist;
                stimuli.visuals[stimulus].grid.weighted = true;
                calculateWeights(blacklist, 1);
                $('#dynamic-grid-' + id[2]).parent().checkbox('check');
            }

            template.stimuli.set(stimuli);
        },
        onUnchecked: function () {
            const id = this.getAttribute('id').split('-'),
                type = id[0],
                field = id[1],
                stimulus = id[2] - 1,
                stimuli = template.stimuli.get();


            if (type === 'dynamic') {
                const variables = stimuli.visuals[stimulus].variables;
                stimuli.visuals[stimulus].variables = _.without(variables, field);

                if (field === 'grid') {
                    const blacklist = stimuli.visuals[stimulus].grid.blacklist;
                    _.each(blacklist, (element) => element.blacklist = true);
                    $('#weighted-grid-' + id[2]).parent().checkbox('uncheck');
                }
            } else if (type === 'weighted') {
                const blacklist = stimuli.visuals[stimulus].grid.blacklist;
                _.each(blacklist, (element) => element.weight = 1);
                stimuli.visuals[stimulus].grid.weighted = false;
            }

            template.stimuli.set(stimuli);
        }
    });
});
