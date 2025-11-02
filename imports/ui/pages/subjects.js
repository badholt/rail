import './subjects.html';
import '../components/forms/subject';

import { Experiments, Subjects } from '../../api/collections';
import { Template } from 'meteor/templating';

Template.subjectCard.events({
    'click .edit'(event, template) {
        /** Set modal form to selected subject:  */
        template.parent().subject.set(template.data);
        template.parent().bday.set(template.data.birthday);

        /** Initialize calendar units: */
        $('#subject-form').form('set value', 'unit', 'weeks');

        /** Open modal: */
        $('#subject-modal').modal('show');
    }
});

Template.subjectCard.helpers({
    experiment(ids) {
        return Experiments.find({ _id: { $in: ids } });
    },
	user(ids) {
		return _.contains(ids, Meteor.userId());
	}
});

Template.subjectCard.onCreated(function () {
    this.autorun(() => this.subscribe('experiment.subject', Template.currentData()._id));
});

Template.subjectModal.onRendered(function () {
    const panel = Template.instance().parent();

    $('#subject-modal')
        .modal({
            detachable: false,
            onHidden() {
                /** Clear form: */
                panel.subject.set({});
                $(this).form('clear values');
            },
            onShow() {
                $.when( $(this).form('get values', [ 'experiments', 'sex', 'strain', 'tags' ]) )
                    .then( () => {
                        /** Initialize calendar & dropdowns: */
                        $('.ui.calendar').calendar({ onChange(date) { panel.bday.set(date); },
                            today: true, type: 'date' });
                        $('.ui.dropdown').dropdown({ allowAdditions: true });
                        $('#units').dropdown({ onChange(value) { panel.units.set(value); } });
                    });
            }
        })
        .modal('attach events', '#add-subject', 'show');
});

Template.subjectPanel.helpers({
    subject() {
        return Template.instance().subject.get();
    },
    subjects() {
        return Subjects.find({}, { sort: { identifier: 1 } });
    }
});

Template.subjectPanel.onCreated(function () {
    this.autorun(() => {
		const user = Meteor.user({ fields: { _id: 1, profile: 1 } });

		if (user) {
			this.subscribe('subjects.user', user._id);
			_.each(user.profile.experiments, (i) => (this.subscribe('subjects.experiment', i)));
		}
	});

    this.bday = new ReactiveVar('');
    this.subject = new ReactiveVar({});
    this.units = new ReactiveVar('weeks');
});
