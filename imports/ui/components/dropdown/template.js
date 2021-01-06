/** components/template.js
 *  Dropdown menu for available experiment templates
 * * * * * * * */
import './template.html';

import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {Templates} from '../../../api/collections';

Template.templateDropdown.helpers({
    encrypt(id) {
        const cipher = Template.instance().parent(2).cipher;

        if (cipher) {
            const stored = _.find(_.invert(cipher), (value, key) => key === id),
                encrypted = stored || _.uniqueId('template_');

            cipher[encrypted] = id;
            return encrypted;
        }
    },
    templates() {
        return Templates.find({}, {sort: {name: 1}});
    }
});

Template.templateDropdown.onCreated(function () {
    /** Subscribes to all experiments accessible with user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => this.subscribe('templates.user', Meteor.userId()));
});

Template.templateDropdown.onRendered(function () {
    const form = Template.instance().parent(2),
        template = form.templateId.get(),
        stored = _.find(_.invert(form.cipher), (value, key) => key === template);
    console.log(form);
    $('#templates')
        .dropdown({
            action: 'activate',
            onChange: (value) => {
                const id = form.cipher[value];

                if (form.page) form.page.set(0);
                form.templateId.set(id);
            }
        })
        .dropdown('set selected', stored);
});
