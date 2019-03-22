import './audio.html';

import _ from "underscore";

import {Template} from "meteor/templating";

Template.audioForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(2),
                page = session.page.get(),
                property = target.name.split('.')[1],
                stages = session.stages.get();

            switch (property) {
                case 'delay':
                case 'duration':
                    stages[page][this.index][property] = value;
                    session.stages.set(stages);
                    break;
            }
            console.log(stages);
        }
    }
});
