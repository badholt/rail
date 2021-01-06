import './cross.html';

import {calculateCenter} from '../../api/client.methods';
import * as d3 from 'd3';
import {Template} from 'meteor/templating';

export const getContainer = (selector) => {
        const container = $(selector),
            dimensions = {height: container.height(), width: container.width()};

        return (selector !== document) ? _.extend(dimensions, container.position()) : dimensions;
    },
    renderCross = (context, settings) => {
        const container = getContainer(context),
            center = calculateCenter(container.height, container.width);

        let group = d3.select('#fixation-cross'),
            cross = group.selectAll('.cross'),
            region = group.select('.region');

        const span = settings.span,
            weight = settings.weight,
            max = (span > weight) ? span : weight,
            x = (1 + settings.offset.x) * center.x,
            y = (1 + settings.offset.y) * center.y;

        /** Fixation Cross: */
        cross.attr('x', (d, i) => i % 2 > 0 ? x - (span / 2) : x - (weight / 2));
        cross.attr('y', (d, i) => i % 2 > 0 ? y - (weight / 2) : y - (span / 2));

        /** After Positioning Return Cross Visibility: */
        cross.attr('fill', '#FFF');

        /** Clickable Cross Region: */
        region.attr('x', () => x - (span / 2));
        region.attr('y', () => y - (span / 2));
    };

Template.cross.onRendered(function () {
    renderCross(!(this.data.preview) ? document : '#cross-preview', this.data);
});
