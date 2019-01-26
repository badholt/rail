import './template.html';

import {Meteor} from "meteor/meteor";
import {Template} from 'meteor/templating';
import {Templates} from '../../../api/collections';

Template.templateDropdown.events({
    'change #templates'(event, template) {
        console.log(this, template);
    }
});

Template.templateDropdown.helpers({
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
    $('#templates').dropdown();
});
