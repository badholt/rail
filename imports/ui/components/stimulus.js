import './stimulus.html';

import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

Template.bars.onRendered(function () {
    let group = d3.select('#stimulus-at-' + this.data.location.x + '-' + this.data.location.y),
        bars = group.selectAll('.bar'),
        region = group.selectAll('.region');

    const height = this.data.height,
        width = this.data.width,
        max = (height > width) ? height : width,
        n = bars.size(),
        opacity = this.data.opacity,
        spacing = this.data.spacing,
        x = Session.get('center x') * 2 * ((this.data.location.x - 0.5) / this.data.grid.x),
        y = Session.get('center y') * 2 * ((this.data.location.y - 0.5) / this.data.grid.y);
    console.log(this.data.location, this.data.height, this.data.width);
    /** Distribute Bars: */
    if (this.data.orientation.value === 0) {
        bars.attr('x', function (d, i) {
            return x - (width / 2);
        });

        bars.attr('y', function (d, i) {
            return i < n / 2 ? y - (i + 0.5) * height * spacing : y + (i - 1.5) * height * spacing;
        });
    } else {
        bars.attr('x', function (d, i) {
            return i < n / 2 ? x - (i + 0.5) * width * spacing : x + (i - 1.5) * width * spacing;
        });

        bars.attr('y', function (d, i) {
            return y - (height / 2);
        });
    }

    /** After Positioning Bars Return Visibility: */
    bars.attr('fill', 'rgba(0,0,0,' + opacity + ')');

    /** Clickable Bars Region: */
    region.attr('height', function () {
        return max;
    });
    region.attr('width', function () {
        return max;
    });
    region.attr('x', function () {
        return x - (max / 2);
    });
    region.attr('y', function () {
        return y - (max / 2);
    });
});