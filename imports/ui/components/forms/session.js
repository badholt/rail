import './session.html';
import _ from "underscore";
import {Template} from "meteor/templating";

Template.sessionForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const form = template.parent(2),
                property = target.name.split('.')[1],
                session = form.session.get();
            console.log(form, session);
            switch (property) {
                case 'correct':
                case 'delay':
                case 'duration':
                case 'iti':
                case 'light.duration':
                case 'total':
                    session[property] = value;
                    form.session.set(session);
                    break;
            }
        }
    }
});
