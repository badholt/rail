import './element.html';

import {Template} from "meteor/templating";

Template.elementDropdown.helpers({
    element() {
        return [
            {name: 'audio', icon: 'music'},
            {name: 'cross', icon: 'plus'},
            {name: 'light', icon: 'lightbulb'},
            {name: 'reward', icon: 'star'},
            {name: 'stimuli', icon: 'bars'}
        ];
    }
});

Template.elementDropdown.onRendered(function () {
    const parent = this.parent(2);

    $('#elements').dropdown({
        on: 'hover',
        onChange: (value) => {
            const stages = parent.stages.get(),
            page = parent.page.get();
            console.log(stages, page);

            stages[page].push({type: value});
            parent.stages.set(stages);
        }
    });
});
