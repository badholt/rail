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

            console.log('this', this, Template.instance());
            console.log(cipher, encrypted, stored);
            cipher[encrypted] = id;
            return encrypted;
        }
    },
    templates() {
        return Templates.find();
    }
});

Template.templateDropdown.onCreated(function () {
    this.autorun(() => {
        /** Subscribe only to shared templates: */
        this.subscribe('templates.user', Meteor.userId());
    });
});

Template.templateDropdown.onRendered(function () {
    const form = Template.instance().parent(2);

    $('#templates').dropdown({
        action: 'activate',
        onChange: (value) => {
            const id = form.cipher[value];

            if (form.page) form.page.set(0);
            form.templateId.set(id);
        }
    });
});
