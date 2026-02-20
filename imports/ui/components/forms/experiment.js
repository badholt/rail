/**
 * ui/components/forms/experiment.js
 *
 * Description:
 *  Defines form mechanics for creating & editing experiments
 * * * * * * * */
import './experiment.html';
import '/imports/ui/components/dropdown/template';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from "meteor/reactive-var";
import { submitExperimentUpdate } from '/imports/ui/components/admin';
import { Template } from 'meteor/templating';

Template.createExperimentForm.events({
    'change input[name=title]'(event, template) {
        const target = event.target || event.srcElement,
            value = $('#experiment-form').form('get value', target.name);

        Meteor.callAsync('getExperimentLink', value).then((link) => template.link.set(link));
    }
});

Template.createExperimentForm.helpers({
    'link'() {
        return Template.instance().link.get();
    }
});

Template.createExperimentForm.onCreated(function () {
    this.link = new ReactiveVar('');
});

Template.editExperimentForm.events({
    /** Submit form on enter key for more responsive feedback: */
    'keydown input'(event, template) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            submitExperimentUpdate(template.data);
            $('[id^=modal-experiment-]').modal('hide');
        }
    }
});
