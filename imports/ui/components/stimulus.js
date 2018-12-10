import './stimulus.html';

import {calculateCenter} from '../../api/client.methods';
import * as d3 from 'd3';
import {Template} from 'meteor/templating';
import {Meteor} from "meteor/meteor";
import {Sessions} from "../../api/collections";

export const translateLong = (frequency, i, max, n, spacing, thickness) => {
        let adjustment, translation;
        if (frequency) {
            translation = (i + 0.5) * spacing / frequency;
        } else {
            adjustment = (spacing * (n + 0.5) * thickness + (n * thickness)) / 2;
            translation = i * thickness * (1.5 + spacing) - adjustment;
        }
        return translation;
    },
    translateShort = (start, thickness) => start - (thickness / 2),
    renderBars = (center, data) => {
        let group = d3.select('#stimulus-at-' + data.location.x + '-' + data.location.y),
            bars = group.selectAll('.bar'),
            region = group.selectAll('.region');
        const height = data.height,
            width = data.width,
            max = (height > width) ? height : width,
            unit = 100,
            n = (data.frequency) ? (max * data.frequency / unit) : bars.size(),
            opacity = data.opacity,
            spacing = (data.frequency) ? unit : data.spacing;

        if (!data.preview) {
            const x = center.x * 2 * ((data.location.x - 0.5) / data.grid.x),
                y = center.y * 2 * ((data.location.y - 0.5) / data.grid.y);

            /** Distribute Bars: */
            if (data.orientation.value === 0) {
                bars.attr('x', translateShort(x, width));
                bars.attr('y', (d, i) => y + translateLong(data.frequency, i, width, n, spacing, height));
            } else {
                bars.attr('x', (d, i) => x + translateLong(data.frequency, i, height, n, spacing, width));
                bars.attr('y', translateShort(y, height));
            }

            /** Clickable Bars Region: */
            region.attr('height', max);
            region.attr('width', max);
            region.attr('x', translateShort(x, max));
            region.attr('y', translateShort(y, max));
        } else {
            const middle = $('#stimulus-at-' + data.location.x + '-' + data.location.y).parent().width() / 2;
            bars.attr('transform', (d, i) => {
                const translation = translateLong(data.frequency, i, height, n, spacing, width);
                return 'translate(' + translation + ', 0)';
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
    },
    stimuli() {
        const max = (this.height > this.width) ? this.height : this.width,
            unit = 100;
        return (this.frequency) ? max * this.frequency / unit : this.bars;
    }
});

Template.bars.onCreated(function () {
    this.getSession = () => FlowRouter.getParam('session');
    this.getStage = () => FlowRouter.getParam('stage');
    this.getTrial = () => parseInt(FlowRouter.getParam('trial'));

    this.autorun(() => {
        this.center = calculateCenter($(document).height(), $(document).width());
        this.session = () => {
            return Sessions.findOne(this.getSession());
        };
    });
});

Template.bars.onRendered(function () {
    const session = this.getSession(),
        stage = this.getStage();
    renderBars(Template.instance().center, this.data);
    // Meteor.call('updateTrial', number, event, session._id, stage);
});