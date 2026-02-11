import './cross.html';

import { calculateCenter } from '../../api/client.methods';
import * as d3 from 'd3';
import { Template } from 'meteor/templating';

export const getContainer = (selector) => {
        const container = $(selector),
            dimensions = {
                height: Math.ceil(container.outerHeight() ?? 0),
                width: Math.ceil(container.outerWidth() ?? 0)
            };

        return (selector !== document) ? _.extend(dimensions, container.position()) : dimensions;
    },
    renderCross = (settings, selector = document) => {
        const container = getContainer(selector),
            center = calculateCenter(container.height, container.width),
            group = d3.select('#fixation-cross'),
            cross = group.selectAll('.cross'),
            region = group.select('.region');

        const span = settings.span,
            weight = settings.weight,
            x = (1 + settings.offset.x) * center.x,
            y = (1 + settings.offset.y) * center.y;

        /** Fixation Cross: */
        cross.attr('x', (_d, i) => i % 2 > 0 ? x - (span / 2) : x - (weight / 2));
        cross.attr('y', (_d, i) => i % 2 > 0 ? y - (weight / 2) : y - (span / 2));

        /** After positioning, return cross visibility: */
        cross.attr('fill', '#fff');

        /** Clickable Cross Region: */
        region.attr('x', () => x - (span / 2));
        region.attr('y', () => y - (span / 2));
    };

Template.cross.onRendered(function () { if (!this.data?.preview) renderCross(this.data); });
