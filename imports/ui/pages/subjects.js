import './subjects.html';

import * as _ from "underscore";

import {Template} from "meteor/templating";
import {Subjects} from "../../api/collections";

Template.subjectForm.events({
    'input textarea'(event) {
        const target = event.target,
            form = $('.modal .ui.form').form('get values'),
            tags = _.compact(form.description.split(/(?:\n?\r?\>\s)/igm));

        console.log(target, form, tags);
    }
});

Template.subjectModal.events({
    'click .button'() {
        const form = $('.modal .ui.form').form('get values'),
            tags = form.description.split('>');

        console.log(form, tags);
    }
});

Template.subjectModal.onRendered(function () {
    $('.ui.modal').modal('attach events', '#add-subject', 'show');
    $('.ui.modal .dropdown').dropdown({
        allowAdditions: true
    });
});

Template.subjectPanel.helpers({
    subjects() {
        return Subjects.find();
    }
});

Template.subjectPanel.onCreated(function () {
    this.autorun(() => this.subscribe('subjects'));
});
