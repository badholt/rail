import './blacklist.html';

import _ from 'underscore';

import {calculateWeights} from '../../api/client.methods';
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
    },
    weighted() {
        return Template.instance().data.weighted;
    }
});

Template.blacklistCell.events({
    'click .column'(event, template) {
        const accordion = template.parent(5),
            blacklistTemplate = template.parent(2),
            stimulus = blacklistTemplate.data.stimulus,
            stimuli = accordion.stimuli.get(),
            blacklist = stimuli.visuals[stimulus].grid.blacklist,
            cell = template.data.cell,
            index = _.findIndex(blacklist, _.matches({x: cell.x, y: cell.y}));

        if (!_.contains(stimuli.visuals[stimulus].variables, 'grid') && this.cell.blacklist) {
            _.each(blacklist, (element, i) => blacklist[i].blacklist = true);
        }

        blacklist[index].blacklist = !this.cell.blacklist;
        // if (blacklistTemplate.data.weighted) calculateWeights(blacklist, 1);
        console.log(this, blacklistTemplate.data);
        accordion.stimuli.set(stimuli);
    },
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            accordion = template.parent(5),
            blacklistTemplate = template.parent(2),
            stimulus = blacklistTemplate.data.stimulus,
            stimuli = accordion.stimuli.get(),
            blacklist = stimuli.visuals[stimulus].grid.blacklist,
            index = _.findIndex(blacklist, _.matches({x: this.cell.x, y: this.cell.y})),
            value = parseFloat($('#stimulus-form-' + (stimulus + 1)).form('get value', target.name));
        console.log(target, value, index, blacklist, this);
        blacklist[index].weight = value;
        // calculateWeights(_.filter(blacklist, !_.matches({x: cell.x, y: cell.y})),
        //     1 - cell.weight);
        console.log(stimuli);
        accordion.stimuli.set(stimuli);

    }
});

Template.blacklistRow.helpers({
    cell(column) {
        return _.find(Template.instance().data.blacklist, _.matches({x: column}));
    },
    row() {
        return Template.instance().data.row;
    },
    weighted() {
        return Template.instance().data.weighted;
    }
});
