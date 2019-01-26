import './session.html';
import _ from "underscore";
import {Template} from "meteor/templating";

Template.sessionForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const form = template.parent(),
                session = form.session.get();

            switch (target.name) {
                case 'correct':
                case 'iti':
                case 'light.duration':
                case 'total':
                    session[target.name] = value;
                    session.session.set(session);
                    break;
            }
        }
    }
});
