import './subjects.html';

import moment from "moment";

import {Template} from "meteor/templating";
import {Experiments, Subjects} from "../../api/collections";

Template.subjectCard.events({
    'click .edit'(event, template) {
        /** Set modal form to selected subject:  */
        template.parent().edit.set(template.data._id);

        /** Open modal: */
        $('#subject-modal').modal('show');
    }
});

Template.subjectCard.helpers({
    experiment(ids) {
        return Experiments.find({_id: {$in: ids}});
    }
});

Template.subjectCard.onCreated(function () {
    this.autorun(() => this.subscribe('experiment.subject', Template.currentData()._id));
});

Template.subjectForm.helpers({
    experiments() {
        /** Find all subscribed experiments for user and subjects: */
        return Experiments.find();
    }
});

Template.subjectForm.onRendered(function () {
    const panel = Template.instance().parent(2);

    $('#subject-form').form({
        onSuccess(event, fields) {
            /** Prevent default browser form submission: */
            event.preventDefault();

            /** Create new subject or update current profile: */
            const id = panel.edit.get();

            console.log(id, fields);
            if (id) Meteor.call('updateSubject', id, fields); else Meteor.call('addSubject', fields);

            /** Clear form: */
            panel.edit.set('');
            $(this).form('clear values');

            /** Close modal: */
            $('#subject-modal').modal('hide');
        }
    });
});

Template.subjectModal.onRendered(function () {
    $('#subject-modal .dropdown').dropdown({allowAdditions: true});
    $('#subject-modal')
        .modal({context: '#main-panel'})
        .modal('attach events', '#add-subject', 'show');
});

Template.subjectPanel.helpers({
    subject() {
        const id = Template.instance().edit.get(),
            subject = Subjects.findOne(id);

        if (subject) {
            const age = moment(subject.birthday).fromNow(true).split(' ');

            /** Restore current values for editing: */
            subject.age = age[0];
            subject.unit = age[1];
            $('#subject-form').form('set values', subject);

            return subject;
        } else {
            return {};
        }
    },
    subjects() {
        return Subjects.find({}, {sort: {identifier: 1}});
    }
});

Template.subjectPanel.onCreated(function () {
    this.autorun(() => this.subscribe('subjects'));
    this.edit = new ReactiveVar('');
});
