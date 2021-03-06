import './reward.html';
import {Template} from "meteor/templating";
import _ from "underscore";

Template.rewardForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(5),
                page = session.page.get(),
                property = target.name.split('.')[1],
                stages = session.stages.get();

            switch (property) {
                case 'delay':
                case 'duration':
                    stages[page][this.index][property] = value;
                    session.stages.set(stages);
                    break;
                case 'amount':
                    const i = template.parent(3).data.i,
                        commands = stages[page][i]['commands'];

                    _.each(commands, (command, j) => {
                        if (command.command === 'dispense') {
                            stages[page][i]['commands'][j][property] = value;
                            session.stages.set(stages);
                        }
                    });
                    break;
            }
        }
    }
});
