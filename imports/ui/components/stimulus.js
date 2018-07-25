import './stimulus.html';

import {calculateCenter} from '../../api/client.methods';
import {Template} from 'meteor/templating';

Template.bars.onCreated(function () {
    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
    });
});

Template.bars.onRendered(function () {
    console.log(this, Template.instance());
    let center = Template.instance().center,
        group = d3.select('#stimulus-at-' + this.data.location.x + '-' + this.data.location.y),
        bars = group.selectAll('.bar'),
        region = group.selectAll('.region');

    const height = this.data.height,
        width = this.data.width,
        max = (height > width) ? height : width,
        n = bars.size(),
        opacity = this.data.opacity,
        spacing = this.data.spacing,
        x = center.x * 2 * ((this.data.location.x - 0.5) / this.data.grid.x),
        y = center.y * 2 * ((this.data.location.y - 0.5) / this.data.grid.y);

    /** Distribute Bars: */
    if (this.data.orientation.value === 0) {
        bars.attr('x', (d, i) => x - (width / 2));
        bars.attr('y', (d, i) => i < n / 2 ? y - (i + 0.5) * height * spacing : y + (i - 1.5) * height * spacing);
    } else {
        bars.attr('x', (d, i) => i < n / 2 ? x - (i + 0.5) * width * spacing : x + (i - 1.5) * width * spacing);
        bars.attr('y', (d, i) => y - (height / 2));
    }

    /** After Positioning Bars Return Visibility: */
    bars.attr('fill', 'rgba(255,255,255,' + opacity + ')');

    /** Clickable Bars Region: */
    region.attr('height', () => max);
    region.attr('width', () => max);
    region.attr('x', () => x - (max / 2));
    region.attr('y', () => y - (max / 2));
});