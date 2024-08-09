import './stimulus.html';

import * as d3 from 'd3';

import {Sessions} from "../../api/collections";
import {Template} from 'meteor/templating';
import _ from "underscore";
import update from "immutability-helper/index";
import {calculateCenter} from "../../api/client.methods";

export const translateBars = (i, bars, spacing, span, weight) => {
        const n = bars + spacing * (bars - 1),
            center = n * weight / 2; // TODO Add option for rect w/ fixed width vs. fixed bars weight; autocalculate spacing, span, or weight
        return center - (spacing * i + i + 1) * weight;
    },
    renderBars = (center, data) => {
        const group = d3.select('#region'),
            stimulus = group.select('#stimulus-at-' + data.location.x + '-' + data.location.y),
            bars = stimulus.selectAll('.bar'),
            box = data.span / 2,
            // TODO: Replace data.offset w/ profile value
            left = (data.offset ? data.offset.x : 0) + center.x * 2 * ((data.location.x - 0.5) / data.grid.x) - box,
            top = (data.offset ? data.offset.y : 0) + center.y * 2 * ((data.location.y - 0.5) / data.grid.y) - box;

        group.attr('transform', 'translate(' + left + ', ' + top + ')');
        stimulus.attr('transform', 'translate(' + box + ' ' + box + ') rotate(' + data.orientation.value + ')');

        /** Distribute bars & Return visibility: */
        bars.attr('x', (d, i) => translateBars(i, data.bars, data.spacing, data.span, data.weight));
        bars.attr('y', () => -box);
        bars.attr('fill', 'rgba(255,255,255,' + data.contrast + ')');

        return data;
    };

Template.bars.helpers({
    dimensions() {
        const data = Template.instance().data;
        if (data.data.location) return renderBars(data.center, data.data);
    },
    max() {
        const data = Template.currentData();
        return Math.max(data.span, data.weight);
    }
});

Template.bars.onCreated(function () {
    this.getSession = () => FlowRouter.getParam('session');
    this.autorun(() => this.session = () => Sessions.findOne(this.getSession()));
});

Template.bars.onRendered(function () {
    renderBars(this.data.center, this.data.data);
});
