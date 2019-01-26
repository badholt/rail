import './reward.html';
import {Template} from "meteor/templating";
import _ from "underscore";

Template.rewardForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(2),
                page = session.page.get(),
                stages = session.stages.get();

            switch (target.name) {
                case 'reward.delay':
                case 'reward.duration':
                    stages[page][this.index][target.name] = value;
                    session.stages.set(stages);
                    break;
            }
        }
    }
});
