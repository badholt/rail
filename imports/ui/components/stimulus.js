import './stimulus.html';

import * as d3 from 'd3';

import {Sessions} from "../../api/collections";
import {Template} from 'meteor/templating';
import _ from "underscore";
import update from "immutability-helper/index";
import {calculateCenter} from "../../api/client.methods";

export const translateBars = (i, n, spacing, thickness) => {
        const adjustment = (spacing * (n + 0.5) * thickness + (n * thickness)) / 2;
        return i * thickness * (1.5 + spacing) - adjustment;
    },
    translateBarsFrequency = (i, frequency, span, unit, weight) => {
        const half = 0.5 * span;
        return half - (i + 0.5) * (unit / frequency) - (0.5 * weight);
    },
    renderBars = (center, data) => {
        const group = d3.select('#region'),
            stimulus = group.select('#stimulus-at-' + data.location.x + '-' + data.location.y),
            bars = stimulus.selectAll('.bar'),
            box = data.span / 2,
            left = center.x * 2 * ((data.location.x - 0.5) / data.grid.x) - box,
            top = center.y * 2 * ((data.location.y - 0.5) / data.grid.y) - box,
            unit = 100;

        group.attr('transform', 'translate(' + left + ', ' + top + ')');
        stimulus.attr('transform', 'translate(' + box + ' ' + box + ') rotate(' + data.orientation.value + ')');

        /** Distribute bars & Return visibility: */
        bars.attr('x', (d, i) => translateBarsFrequency(i, data.frequency, data.span, unit, data.weight));
        bars.attr('y', () => -box);
        bars.attr('fill', 'rgba(255,255,255,' + data.contrast + ')');

        return data;
    };

Template.bars.helpers({
    dimensions() {
        const data = Template.instance().data;
        if (data.data.location) return renderBars(data.center, data.data);
    },
    gratings(max) {
        const template = Template.currentData(), unit = 100;
        return (template.frequency) ? max * template.frequency / unit : template.bars;
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
