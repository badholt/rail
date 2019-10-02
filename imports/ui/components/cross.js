import './cross.html';

import {calculateCenter} from '../../api/client.methods';
import * as d3 from 'd3';
import {Template} from 'meteor/templating';

export const renderCross = (context, settings) => {
    const template = Template.instance(),
        container = template.getContainer(context),
        center = template.center(container.height, container.width);
    console.log(container, center, settings);
    let group = d3.select('#fixation-cross'),
        cross = group.selectAll('.cross'),
        region = group.select('.region');

    const span = settings.span,
        weight = settings.weight,
        max = (span > weight) ? span : weight,
        x = center.x,
        y = center.y * 2 - (max * 1.5);

    /** Fixation Cross: */
    cross.attr('x', (d, i) => i % 2 > 0 ? x - (span / 2) : x - (weight / 2));
    cross.attr('y', (d, i) => i % 2 > 0 ? y - (weight / 2) : y - (span / 2));

    /** After Positioning Return Cross Visibility: */
    cross.attr('fill', '#FFF');

    /** Clickable Cross Region: */
    region.attr('x', () => x - (span / 2));
    region.attr('y', () => y - (span / 2));
};

Template.cross.onCreated(function () {
    this.autorun(() => {
        this.center = (height, width) => calculateCenter(height, width);
        this.getContainer = (selector) => {
            const container = $(selector),
                dimensions = {height: container.height(), width: container.width()};

            return (selector !== document) ? _.extend(dimensions, container.position()) : dimensions;
        };
    });
});

Template.cross.onRendered(function () {
    console.log(this, Template.instance().parent(4));

    renderCross(!(this.data.preview) ? document : '#cross-preview', this.data);
});
