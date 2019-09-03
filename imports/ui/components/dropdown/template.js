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
    this.autorun(() => {
        /** Subscribe only to shared templates: */
        this.subscribe('templates.user', Meteor.userId());
    });
});

Template.templateDropdown.onRendered(function () {
    const form = Template.instance().parent(2),
        template = form.templateId.get(),
        stored = _.find(_.invert(form.cipher), (value, key) => key === template);

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
