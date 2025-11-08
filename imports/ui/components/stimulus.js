import './stimulus.html';

import * as d3 from 'd3';

import { flipOrientation } from '../pages/trial';
import { Sessions } from '../../api/collections';
import { Template } from 'meteor/templating';

Template.bars.helpers({
    dimensions() {
        const data = Template.instance().data;
        if (data.data.location) return Template.instance().renderBars(data.center, data.data);
    },
    max() {
        const data = Template.currentData();
        return Math.max(data.span, data.weight);
    }
});

Template.bars.onCreated(function () {
    this.getSession = () => FlowRouter.getParam('session');
    this.session = () => Sessions.findOne(this.getSession());
    this.autorun(() => this.session());

    this.translateBars = (i, bars, spacing, weight) => {
        const n = bars + spacing * (bars - 1),
            center = n * weight / 2; // TODO Add option for rect w/ fixed width vs. fixed bars weight; autocalculate spacing, span, or weight

        return center - (spacing * i + i + 1) * weight;
    };
    this.renderBars = (center, data) => {
        const bias = this.parent(3).data.trial.bias,
            group = d3.select(`#region-at-${ data.location.x }-${ data.location.y }`),
            orientation = (bias) ? flipOrientation(data?.orientation?.value) : data?.orientation?.value,
            stimulus = group.select(`#stimulus-at-${ data.location.x }-${ data.location.y }`),
            bars = stimulus.selectAll('.bar'),
            box = data.span / 2,
            // TODO: Replace data.offset w/ profile value
            left = (data.offset ? data.offset.x : 0) + center.x * 2 * ((data.location.x - 0.5) / data.grid.x) - box,
            top = (data.offset ? data.offset.y : 0) + center.y * 2 * ((data.location.y - 0.5) / data.grid.y) - box;

        group.attr('transform', `translate(${ left }, ${ top })`);
        stimulus.attr('transform', `translate(${ box } ${ box }) rotate(${ orientation })`);

        /** Distribute bars & Return visibility: */
        bars.attr('x', (_d, i) => this.translateBars(i, data.bars, data.spacing, data.weight));
        bars.attr('y', () => -box);
        bars.attr('fill', `rgba(255,255,255,${ data.contrast })`);

        return data;
    };
});

Template.bars.onRendered(function () { this.renderBars(this.data.center, this.data.data); });
