import './blacklist.html';

import _ from 'underscore';

import {ReactiveVar} from "meteor/reactive-var";
import {Template} from "meteor/templating";

Template.blacklist.helpers({
    blacklist(row) {
        const stimulus = Template.instance().data.stimulus,
            stimuli = Template.instance().parent(3).stimuli.get(),
            visuals = stimuli.visuals[stimulus];
        if (visuals) return _.filter(visuals.grid.blacklist, _.matches({y: row}));
    },
    columns() {
        return Template.instance().data.columns;
    },
    rows() {
        return Template.instance().data.rows;
    }
});

Template.blacklistCell.events({
    'click .column'(event, template) {
        const stimulus = template.parent(2).data.stimulus,
            stimuli = template.parent(5).stimuli.get(),
            blacklist = stimuli.visuals[stimulus].grid.blacklist,
            cell = template.data.cell,
            index = _.findIndex(blacklist, _.matches({x: cell.x, y: cell.y}));

        blacklist[index].blacklist = !this.cell.blacklist;
        template.parent(5).stimuli.set(stimuli);
    }
});

Template.blacklistRow.helpers({
    cell(column) {
        return _.find(Template.instance().data.blacklist, _.matches({x: column}));
    },
    row() {
        return Template.instance().data.row;
    }
});
