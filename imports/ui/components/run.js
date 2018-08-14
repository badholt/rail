import './blacklist';
import './run.html';

import _ from 'underscore';

import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

const generateBlacklist = (blacklist, columns, rows) => {
        for (let x = columns.first; x < columns.last; x++) for (let y = rows.first; y < rows.last; y++) {
            blacklist.push({
                x: x,
                y: y,
                blacklist: false
            });
        }
        return blacklist;
    },
    generateVisuals = (visuals, first, last) => {
        const columns = 3, rows = 3;

        for (let i = first; i < last; i++) {
            let previous = (visuals[first - 1]) ? visuals[first - 1] : {
                contrast: 1,
                delay: 500,
                duration: 5000,
                grid: {
                    blacklist: generateBlacklist([],
                        {first: 1, last: columns + 1},
                        {first: 1, last: rows + 1}),
                    x: 3,
                    y: 3
                },
                iti: 10000,
                spacing: 5,
                span: 300,
                variables: ['grid'],
                weight: 5
            };
            visuals.push(previous);
        }
        return visuals;
    }, submitForm = (form) => {
        const devices = $('#device-form .ui.dropdown').dropdown('get value'),
            stimuli = form.stimuli.get(),
            trials = form.trials.get();

        if (devices) devices.forEach((device) => {
            Meteor.call('generateSettings', trials.total, stimuli, (error, result) => {
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
    'input input'(event) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));
        let form = Template.instance(),
            stimuli = form.stimuli.get();
        let trials = form.trials.get(), grid;

        switch (target.name) {
            case 'contrast':
            case 'delay':
            case 'duration':
            case 'iti':
            case 'min':
            case 'spacing':
            case 'span':
            case 'step':
            case 'weight':
                stimuli.visuals[this.index][target.name] = value;
                form.stimuli.set(stimuli);
                break;
            case 'grid-x':
                grid = stimuli.visuals[this.index].grid;
                grid.blacklist = (value > grid.x)
                    ? generateBlacklist(grid.blacklist,
                        {first: grid.x + 1, last: value + 1},
                        {first: 1, last: grid.y + 1})
                    : _.reject(grid.blacklist, _.matches({x: grid.x}));
                grid.x = value;
                form.stimuli.set(stimuli);
                break;
            case 'grid-y':
                grid = stimuli.visuals[this.index].grid;
                grid.blacklist = (value > grid.y)
                    ? generateBlacklist(grid.blacklist,
                        {first: 1, last: grid.x + 1},
                        {first: grid.y + 1, last: value + 1})
                    : _.reject(grid.blacklist, _.matches({y: grid.y}));
                grid.y = value;
                form.stimuli.set(stimuli);
                break;
            case 'number':
                stimuli[target.name] = value;
                stimuli.visuals = (value < stimuli.visuals.length)
                    ? _.first(stimuli.visuals, value)
                    : generateVisuals(stimuli.visuals, stimuli.visuals.length, value);
                form.stimuli.set(stimuli);
                break;
            case 'total':
                trials[target.name] = value;
                form.trials.set(trials);
                break;
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
        total: 5
    });

    this.autorun(() => {
        /** Subscribe to devices and authorized users: */
        this.subscribe('users', {$or: [{_id: {$in: this.users}}, {'profile.device': true}]});
    });
});

Template.accordion.onRendered(function () {
    $('.ui.accordion').accordion({exclusive: false});
});

Template.deviceForm.helpers({
    device() {
        return Meteor.users.find({'profile.device': true});
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

Template.stimulusForm.onRendered(function () {
    let template = Template.instance().parent(2);

    $('.ui.checkbox').checkbox({
        onChange: function () {
            const id = this.getAttribute('id').split('-dynamic-'),
                field = id[0],
                index = id[1] - 1;
            let stimuli = template.stimuli.get(),
                variables = stimuli.visuals[index].variables;

            variables = (_.contains(variables, field))
                ? _.without(variables, field)
                : _.union(variables, [field]);
            stimuli.visuals[index].variables = variables;
            template.stimuli.set(stimuli);
        }
    });
});

Template.stimulusForm.helpers({
    checked(field) {
        return _.contains(this.visuals.variables, field);
    }
});
