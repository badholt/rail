/** components/template.js
 *  Dropdown menu for available experiment templates
 * * * * * * * */
import './template.html';

import { Meteor } from "meteor/meteor";
import { Template } from 'meteor/templating';
import { Templates } from '../../../api/collections';

Template.templateDropdown.helpers({
    encrypt(id) {
        const cipher = Template.instance().parent(2).cipher;

        if (cipher) {
            const stored = _.find(_.invert(cipher), (_value, key) => key === id),
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

Template.templateDropdown.onRendered(() => {
    const template = Template.instance(),
        cipher = template.get('cipher'),
        id = template.get('templateId'),
        page = template.get('page'),
        stored = _.find(_.invert(cipher), (_value, key) => key === id.get());

    $('#templates')
        .dropdown({
            action: 'activate',
            onChange: (value) => {
                if (page) page.set(0);
                if (id) id.set(cipher[ value ]);
            }
        })
        .dropdown('set selected', stored);
});
