/** components/dropdown/offset.js
 *  Dropdown menu for previewing offsets in all available experiment templates
 * * * * * * * */
import './offset.html';

import { Meteor } from "meteor/meteor";
import { renderCross } from '../cross';
import { Template } from 'meteor/templating';
import { Templates } from '../../../api/collections';

export const decryptId = (cipher, id) => _.find(_.invert(cipher), (value, key) => key === id),
    encryptId = (cipher, id) => {
        if (!cipher) return;

        const stored = decryptId(cipher, id),
            encrypted = stored || _.uniqueId('template_');

        cipher[ encrypted ] = id;
        return encrypted;
    },
    getElement = (stages, type) => (_.find(_.flatten(stages), (element) => (element.type === type)));

    Template.offsetDropdown.helpers({
        templates() {
            return Array.from(Template.instance().templates, ([ k,v ]) => ({ key: k, value: v }));
        }
    });

Template.offsetDropdown.onCreated(function () {
    /** Subscribes to all experiments accessible with user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => this.subscribe('templates.user', Meteor.userId()));
    this.templates = new Map();
});

Template.offsetDropdown.onRendered(function () {
    const dd = Template.instance(),
        form = dd.parent(),
        device = dd.parent(4);

    Meteor.call('getTemplates',
        { "stages": { "$elemMatch": { "$elemMatch": { "type": "cross" } } } },
        { 'fields': { '_id': 1, 'name': 1, 'stages': 1 }, 'sort': {'name': 1} },
        (err, templates) => {
            const offsetElement = (id, type) => {
                // Update coordinates to match default of selected template
                const e = updateElement(form.elements.get(), id, type),
                    o = form.offsets.get(),
                    p = form.preview.get();
                
                // Recalculate offset combo
                _.each(o, (t) => {
                    if (t.offset) _.each(t.offset, (v,k) => {
                        //o[ type ][ 'offset' ][ k ] = e[ type ][ 'offset' ][ k ]; // Make inputs reflect template value
                        p[ type ][ 'offset' ][ k ] = v + e[ type ][ 'offset' ][ k ];
                    });
                });

                // Update cross location to new offset coordinates
                form.elements.set(e);
                form.preview.set(p);

                // Render the cross at the new coordinates
                renderCross('#cross-preview', p[ 'cross' ]);
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', p);
            },
            updateElement = (elements, id, type) => ((dd.templates.has(id))
                ? _.defaults({[ type ]: dd.templates.get(id)[ type ]}, elements)
                : elements);

            // Encrypt all template IDs, so that they're not stored in browser.
            // Add templates to cipher, so that other ID references may be obuscated
            // Grab element default coordinates for each template
            _.each(templates, (t) => dd.templates.set(encryptId(device.cipher, t._id), {
                cross: getElement(t.stages, 'cross'),
                name: t.name
            }));

            

            // Verify at least one template w/ calibratible elements was found
            if (dd.templates.size > 0) {
                // Select first template as default when modal opens
                const key = dd.templates.keys().next().value;

                // Update cross location to match default template
                offsetElement(key, 'cross');

                // Set dropdown selection to default template
                this.$('#offsets').dropdown({
                    action: 'activate',
                    onChange: (key) => {
                        // Update cross location w/ selected template offset
                        offsetElement(key, 'cross');
                    }
                });

                // Select after brief delay allowing dropdown to populate
                Meteor.setTimeout(() => { this.$('#offsets').dropdown('set selected', key); }, 10);
            }
    });
});
