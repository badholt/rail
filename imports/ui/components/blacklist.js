import './blacklist.html';

import _ from 'underscore';

import {Template} from "meteor/templating";

Template.blacklist.helpers({
    blacklist(y) {
        const index = Template.instance().data.index,
            session = Template.instance().parent(5),
            page = session.page.get(),
            stages = session.stages.get();

        console.log(session, page, stages);
        const stimuli = stages[page][index];

        if (stimuli && stimuli.grid) return {
            blacklist: _.filter(stimuli.grid.blacklist, _.matches({y: y})),
            row: y,
            stimulus: index,
            weighted: stimuli.grid.weighted,
            x: stimuli.grid.x,
            y: stimuli.grid.y
        };
    },
    grid() {
        return Template.instance().data.grid;
    }
});

Template.blacklistCell.events({
    'click .column'(event, template) {
        const session = template.parent(6),
            page = session.page.get(),
            stages = session.stages.get(),
            stimulus = stages[page][Template.instance().data.stimulus],
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
