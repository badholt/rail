import './element.html';

import {Template} from "meteor/templating";

Template.elementDropdown.helpers({
    element() {
        return [
            {name: 'audio', icon: 'music'},
            {name: 'cross', icon: 'plus'},
            {name: 'lights', icon: 'lightbulb'},
            {name: 'reward', icon: 'star'},
            {name: 'stimuli', icon: 'bars'}
        ];
    }
});

Template.elementDropdown.onRendered(function () {
    const session = this.parent(2);

    $('#elements').dropdown({
        on: 'hover',
        onChange: (value) => {
            const stages = session.stages.get(),
                page = session.page.get();

            stages[page].push({delay: 0, duration: 1000, type: value});
            session.stages.set(stages);
        }
    });
});
