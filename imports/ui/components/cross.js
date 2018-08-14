import './cross.html';

import {calculateCenter} from '../../api/client.methods';
import {Template} from 'meteor/templating';

export const renderCross = (settings) => {
    let center = Template.instance().center,
        group = d3.select('#fixation-cross'),
        cross = group.selectAll('.cross'),
        region = group.select('.region');

    const span = settings.span,
        weight = settings.weight,
        x = center.x,
        y = center.y * 1.5;


    /** Fixation Cross: */
    cross.attr('x', (d, i) => i % 2 > 0 ? x - (span / 2) : x - (weight / 2));
    cross.attr('y', (d, i) => i % 2 > 0 ? y - (weight / 2) : y - (span / 2));

    /** After Positioning Return Cross Visibility: */
    cross.attr('fill', '#FFF');

    /** Clickable Cross Region: */
    region.attr('x', () => {
        return x - (span / 2);
    });
    region.attr('y', () => {
        return y - (span / 2);
    });
};

Template.cross.onCreated(function () {
    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
    });
});

Template.cross.onRendered(function () {
    renderCross(this.data);
});
