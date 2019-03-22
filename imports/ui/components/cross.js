import './cross.html';

import {calculateCenter} from '../../api/client.methods';
import * as d3 from 'd3';
import {Template} from 'meteor/templating';
import {Meteor} from "meteor/meteor";

export const renderCross = (settings, preview) => {
    const template = Template.instance(),
        container = (preview) ? template.getContainer('#cross-preview')
            : template.getContainer(document),
        center = template.center(container.height, container.width);
    console.log(container, center);
    let group = d3.select('#fixation-cross'),
        cross = group.selectAll('.cross'),
        region = group.select('.region');

    const span = settings.span,
        weight = settings.weight,
        max = (span > weight) ? span : weight,
        x = center.x,
        y = center.y * 2 - (max / 2);

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
            const container = $(selector);
            if (selector !== document) {
                const position = container.position();
                return {height: container.height(), width: container.width(), x: position.x, y: position.y};
            } else {
                return {height: container.height(), width: container.width()};
            }
        };
    });
});

Template.cross.onRendered(function () {
    const parent = this.parent();

    if (parent.trial && parent.session()) {
        const number = this.parent().trial.get(),
            session = this.parent().session();

        if (number && session) {
            const stage = 0;
            // Meteor.call('updateTrial', number, {type: 'cross', timeStamp: Date.now()}, session._id, stage);
            // Meteor.call('updateTrial', trial._id, 'data.' + stage, 'push', data);
        }

        renderCross(this.data, false);
    } else {
        renderCross(this.data, true);
    }
});
