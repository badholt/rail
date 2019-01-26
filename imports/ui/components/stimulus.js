import './stimulus.html';

import * as d3 from 'd3';

import {calculateCenter} from '../../api/client.methods';
import {Sessions} from "../../api/collections";
import {Template} from 'meteor/templating';

export const translateBars = (i, n, spacing, thickness) => {
        const adjustment = (spacing * (n + 0.5) * thickness + (n * thickness)) / 2;
        return i * thickness * (1.5 + spacing) - adjustment;
    },
    translateBarsFrequency = (x, i, frequency, span, unit, weight) => {
        const half = 0.5 * span;
        return x + half - (i + 0.5) * (unit / frequency) - (0.5 * weight);
    },
    translateCenter = (start, thickness) => start - (thickness / 2),
    renderBars = (center, data) => {
        let group = d3.select('#stimulus-at-' + data.location.x + '-' + data.location.y),
            bars = group.selectAll('.bar'),
            region = group.selectAll('.region');

        const max = Math.max(data.span, data.weight),
            unit = 100,
            n = bars.size(),
            x = center.x * 2 * ((data.location.x - 0.5) / data.grid.x),
            y = center.y * 2 * ((data.location.y - 0.5) / data.grid.y),
            translation = {
                x: (d, i) => translateBarsFrequency(x, i, data.frequency, data.span, unit, data.weight),
                y: () => translateCenter(y, data.span)
            };

        /** Distribute Bars: */
        bars.attr('x', (d, i) => translation.x(d, i));
        bars.attr('y', (d, i) => translation.y(d, i));

        /** Clickable Bars Region: */
        region.attr('height', max);
        region.attr('width', max);
        region.attr('x', translateCenter(x, max));
        region.attr('y', translateCenter(y, max));

        /** After Positioning Bars Return Visibility: */
        bars.attr('fill', 'rgba(255,255,255,' + data.contrast + ')');

        /** Center the group for form preview: */
        if (data.preview) group.style('transform', 'translate(50%, 50%)');

        return data;
    };

Template.bars.helpers({
    dimensions() {
        const template = Template.instance(),
            center = (!template.data.preview) ? template.center($(window).height(), $(window).width())
                : {x: 0, y: 0};
        return renderBars(center, template.data);
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

    this.autorun(() => this.center = (height, width) => calculateCenter(height, width));
    this.autorun(() => this.session = () => Sessions.findOne(this.getSession()));
});

Template.bars.onRendered(function () {
    const center = (!this.data.preview) ? this.center($(window).height(), $(window).width())
        : {x: 0, y: 0};
    renderBars(center, this.data);
});