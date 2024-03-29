/** components/offset.js
 *  Dropdown menu for previewing offsets in all available experiment templates
 * * * * * * * */
import './offset.html';

import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {Templates} from '../../../api/collections';

Template.offsetDropdown.helpers({
    encrypt(id) {
        const cipher = Template.instance().parent().cipher;

        if (cipher) {
            const stored = _.find(_.invert(cipher), (value, key) => key === id),
                encrypted = stored || _.uniqueId('template_');

            cipher[encrypted] = id;
            return encrypted;
        }
    },
    offset (stages, type) {
        const element = _.find(_.flatten(stages), (element) => (element.type === type));
        return element.offset;
    },
    templates() {
        return Templates.find({ "stages": { "$elemMatch": { "$elemMatch": { "type": "cross" }}}}, {sort: {name: 1}});
    }
});

Template.offsetDropdown.onCreated(function () {
    /** Subscribes to all experiments accessible with user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => this.subscribe('templates.user', Meteor.userId()));
});

Template.offsetDropdown.onRendered(function () {
    const form = Template.instance().parent();
    console.log(form);
    const template = form.templateId.get(),
        stored = _.find(_.invert(form.cipher), (value, key) => key === template);

    $('#offsets')
        .dropdown({
            action: 'activate',
            onChange: (value) => {
                //const id = form.cipher[value];
                form.templateId.set(value);
            }
        })
        .dropdown('set selected', stored);
});
