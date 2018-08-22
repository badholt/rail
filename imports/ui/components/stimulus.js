import './stimulus.html';

import {calculateCenter} from '../../api/client.methods';
import * as d3 from 'd3';
import {Template} from 'meteor/templating';

export const renderBars = (center, data) => {
    let group = d3.select('#stimulus-at-' + data.location.x + '-' + data.location.y),
        bars = group.selectAll('.bar'),
        region = group.selectAll('.region');

    const height = data.height,
        width = data.width,
        max = (height > width) ? height : width,
        n = bars.size(),
        opacity = data.opacity,
        spacing = data.spacing;

    if (!data.preview) {
        const x = center.x * 2 * ((data.location.x - 0.5) / data.grid.x),
            y = center.y * 2 * ((data.location.y - 0.5) / data.grid.y);

        /** Distribute Bars: */
        if (data.orientation.value === 0) {
            const min = (spacing * (n + 0.5) * height + (n * height)) / 2;
            bars.attr('x', (d, i) => x - (width / 2));
            bars.attr('y', (d, i) => y + i * height * (1.5 + spacing) - min);
        } else {
            const min = (spacing * (n + 0.5) * width + (n * width)) / 2;
            bars.attr('x', (d, i) => x + i * width * (1.5 + spacing) - min);
            bars.attr('y', (d, i) => y - (height / 2));
        }

        /** Clickable Bars Region: */
        region.attr('height', () => max);
        region.attr('width', () => max);
        region.attr('x', () => x - (max / 2));
        region.attr('y', () => y - (max / 2));
    } else {
        bars.attr('transform', (d, i) => {
            const h = i * width * (1.5 + spacing),
                min = (spacing * (n - 1) * width + (n * width)) / 2;
            return 'translate(' + (h + min) + ', 0)';
        });
    }

    /** After Positioning Bars Return Visibility: */
    bars.attr('fill', 'rgba(255,255,255,' + opacity + ')');
};

Template.bars.helpers({
    dimensions() {
        const template = Template.instance();
        renderBars(template.center, template.data);
        return template.data;
    }
});

Template.bars.onCreated(function () {
    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
    });
});

Template.bars.onRendered(function () {
    renderBars(Template.instance().center, this.data);
});