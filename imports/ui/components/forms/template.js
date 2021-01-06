import './template.html';

import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";

Template.templateForm.onRendered(function () {
    const session = Template.instance().parent(3);

    $('#template-form').form({
        onSuccess(event, fields) {
            /** Prevent default browser form submission: */
            event.preventDefault();

            //TODO: Find if template already exists
            Meteor.call('addTemplate', {
                icon: fields.icon || '',
                inputs: session.inputs.get(),
                name: fields.name,
                number: session.number,
                session: session.session.get(),
                stages: session.stages.get()
            });

            /** Close modal: */
            $('#template-modal').modal('hide');
        }
    });
});