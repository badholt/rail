import './input.html';

import {Template} from "meteor/templating";

Template.inputDropdown.helpers({
    input() {
        return [
            {name: 'click', icon: 'mouse pointer'},
            {name: 'infrared', icon: 'wifi'}
        ];
    }
});

Template.inputDropdown.onRendered(function () {
    const parent = this.parent();

    $('#inputs').dropdown({
        on: 'hover',
        onChange: (value) => {
            const inputs = parent.inputs.get(),
                page = parent.page.get();

            inputs[page].push({type: value});
            parent.inputs.set(inputs);
        }
    });
});
