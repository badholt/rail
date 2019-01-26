import './cross.html';

import _ from "underscore";

import {Template} from "meteor/templating";

Template.crossForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(2),
                page = session.page.get(),
                stages = session.stages.get();

            switch (target.name) {
                case 'span':
                case 'weight':
                    stages[page][this.index][target.name] = value;
                    session.stages.set(stages);
                    break;
            }
        }
    }
});

Template.crossForm.helpers({
    // TODO: Find a better solution for rendering cross preview:
    visible() {
        return Template.instance().parent().opened.get();
    }
});

