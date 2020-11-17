import './cross.html';

import _ from "underscore";

import {Template} from "meteor/templating";

Template.crossForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(5),
                page = session.page.get(),
                stages = session.stages.get();

            switch (target.name) {
                case 'delay':
                case 'duration':
                case 'span':
                case 'weight':
                    stages[page][template.data.i][target.name] = value;
                    session.stages.set(stages);
                    break;
            }
        }
    }
});

Template.crossForm.helpers({
    // TODO: Find a better solution for rendering cross preview:
    visible() {
        return Template.instance().parent(3).opened.get();
    }
});

Template.crossForm.onCreated(function () {
   console.log(this);
   if (!this.data.span || !this.data.weight) {
       const session = this.parent(5),
           stages = session.stages.get();

       stages[this.data.page][this.data.i].span = 75;
       stages[this.data.page][this.data.i].weight = 20;
       session.stages.set(stages);
   }
});

