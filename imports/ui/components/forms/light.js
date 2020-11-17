import './light.html';
import {Template} from "meteor/templating";
import _ from "underscore";

Template.lightForm.events({
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
                case 'dim':
                case 'duration':
                    stages[page][template.data.i][property] = value;
                    session.stages.set(stages);
                    break;
            }
        }
    }
});
