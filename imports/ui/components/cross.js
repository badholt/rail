import './cross.html';
import {Template} from 'meteor/templating';

export const renderCross = function (settings) {
    let group = d3.select('#fixation-cross'),
        cross = group.selectAll('.cross'),
        region = group.select('.region');

    const span = settings.span,
        weight = settings.weight,
        x = Session.get('center x'),
        y = Session.get('center y') * 1.5;


    /** Fixation Cross: */
    cross.attr('x', function (d, i) {
        return i % 2 > 0 ? x - (span / 2) : x - (weight / 2);
    });
    cross.attr('y', function (d, i) {
        return i % 2 > 0 ? y - (weight / 2) : y - (span / 2);
    });

    /** After Positioning Return Cross Visibility: */
    cross.attr('fill', '#FFF');

    /** Clickable Cross Region: */
    region.attr('x', function () {
        return x - (span / 2);
    });
    region.attr('y', function () {
        return y - (span / 2);
    });
};

Template.cross.onRendered(function () {
    renderCross(this.data);
});
