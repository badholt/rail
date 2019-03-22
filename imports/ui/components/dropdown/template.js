import './template.html';

import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {Templates} from '../../../api/collections';

Template.templateDropdown.helpers({
    encrypt(id) {
        const encrypted = _.uniqueId('user_');

        Template.instance().parent(2).cipher[encrypted] = id;
        return encrypted;
    },
    template() {
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
    const form = Template.instance().parent();

    $('#templates').dropdown({
        action: (text, value) => {
            const id = form.cipher[value];
            form.templateId.set(id);
        }
    });
});
