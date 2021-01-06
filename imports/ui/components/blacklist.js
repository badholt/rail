import './blacklist.html';

import _ from 'underscore';

import {Template} from "meteor/templating";

Template.blacklist.helpers({
    blacklist(y, index) {
        const session = Template.instance().parent(7),
            page = session.page.get(),
            stages = session.stages.get();
        const stimuli = stages[page][index] || { //TODO: Update default stimulus
            "type": "stimuli",
            "bars": 3,
            "contrast": 1,
            "delay": 0,
            "duration": 5000,
            "frequency": 4,
            "grid": {
                "blacklist": [
                    {
                        "x": 1,
                        "y": 1,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 1,
                        "y": 2,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 1,
                        "y": 3,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 2,
                        "y": 1,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 2,
                        "y": 2,
                        "blacklist": false,
                        "weight": 1
                    },
                    {
                        "x": 2,
                        "y": 3,
                        "blacklist": false,
                        "weight": 1
                    },
                    {
                        "x": 3,
                        "y": 1,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 3,
                        "y": 2,
                        "blacklist": true,
                        "weight": 1
                    },
                    {
                        "x": 3,
                        "y": 3,
                        "blacklist": true,
                        "weight": 1
                    }
                ],
                "weighted": false,
                "x": 3,
                "y": 3
            },
            "location": {
                "x": 1,
                "y": 1
            },
            "number": 1,
            "orientation": [
                {
                    "units": "deg",
                    "value": 0
                },
                {
                    "units": "deg",
                    "value": 90
                }
            ],
            "spacing": 2,
            "span": 100,
            "variables": [
                "location",
                "orientation"
            ],
            "weight": 5
        };

        if (stimuli && stimuli.grid) return {
            blacklist: _.filter(stimuli.grid.blacklist, _.matches({y: y})),
            row: y,
            stimulus: index,
            weighted: stimuli.grid.weighted,
            x: stimuli.grid.x,
            y: stimuli.grid.y
        };
    }
});

Template.blacklistCell.events({
    'click .column'(event, template) {
        console.log(this, template, template.parent(9));
        const session = template.parent(9),
            page = session.page.get(),
            stages = session.stages.get(),
            stimulus = stages[page][template.data.stimulus - 1],
            blacklist = stimulus.grid.blacklist,
            cell = template.data.cell,
            index = _.findIndex(blacklist, _.matches({x: cell.x, y: cell.y}));

        if (!_.contains(stimulus.variables, 'location') && this.cell.blacklist) {
            _.each(blacklist, (element, i) => blacklist[i].blacklist = true);
        }

        blacklist[index].blacklist = !this.cell.blacklist;
        // if (blacklistTemplate.data.weighted) calculateWeights(blacklist, 1);
        session.stages.set(stages);
    },
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            number = Template.instance().data.stimulus,
            session = template.parent(6),
            page = session.page.get(),
            stages = session.stages.get(),
            stimulus = stages[page][number],
            blacklist = stimulus.grid.blacklist,
            index = _.findIndex(blacklist, _.matches({x: this.cell.x, y: this.cell.y}));

        blacklist[index].weight = parseFloat($('#stimulus-form-' + (number + 1))
            .form('get value', target.name));
        // calculateWeights(_.filter(blacklist, !_.matches({x: cell.x, y: cell.y})),
        //     1 - cell.weight);
        session.stages.set(stages);
    }
});

Template.blacklistRow.helpers({
    cell(x) {
        const row = Template.instance().data;
        if (row) {
            const cell = _.find(row.blacklist, _.matches({x: x}));

            return {
                cell: cell, column: x, row: row.row, stimulus: row.stimulus,
                weighted: row.weighted
            };
        }
    }
});
