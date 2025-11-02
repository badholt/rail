import './subject.html';

import moment from 'moment';

import { Experiments } from '/imports/api/collections';
import { Template } from 'meteor/templating';

Template.subjectForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const panel = template.parent(2);
            
            switch (target.name) {
                case 'age':
                    const bday = panel.bday.get(),
                        units = panel.units.get(),
                        date = moment().subtract(value, units).toDate();                

                    panel.bday.set(date);
                    break;
            }
        }
    }
});

Template.subjectForm.helpers({
	age(bday, unit) {
		const amount = moment().diff(moment(bday), unit, true);
		return (bday) ? { amount, unit } : { amount: 0, unit };
	},
	bday() {
		return Template.instance().parent(2).bday.get();
	},
    participation() {
        /** Find all subscribed experiments for user and subjects: */
        return Experiments.find();
    },
    strains() {
    	return strains = [
    		{ name: 'C57BL/6', value: 'wt' },
    		{ name: 'DAT-Cre', value: 'dat' },
    		{ name: 'VGAT-Cre', value: 'vgat' }
    	];
    },
    timespan() {
    	return [ 'days', 'weeks', 'months', 'years' ];
    },
    units() {
    	return Template.instance().parent(2).units.get();
    }
});

Template.subjectForm.onRendered(function () {
    const panel = Template.instance().parent(2),
    	fields = {
    		age: 'decimal',
    		birthday: 'date',
    		description: { optional: true },
    		experiments: { optional: true },
    		identifier: 'notEmpty',
    		name: { optional: true },
    		protocol: { optional: true },
    		sex: 'notEmpty',
    		strain: 'notEmpty',
    		tags: { optional: true },
    		unit: 'notEmpty'
    	};

    $('#subject-form').form({ fields, onSuccess(event, fields) {
        /** Prevent default browser form submission: */
        event.preventDefault();

        const subject = panel.subject.get(),
        	experiments = _.compact(fields.experiments.split(',')),
        	tags = _.compact(fields.tags.split(',')),
        	data = _.defaults({ experiments, tags }, fields);

        /** Create new subject or update current profile: */
        if (!_.isEmpty(subject)) {
            Meteor.call('updateSubject', subject._id, data);
        } else {
            Meteor.call('addSubject', data);
        }

        /** Close modal: */
        $('#subject-modal').modal('hide');
    } });
});
