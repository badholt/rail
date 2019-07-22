import './audio.html';

import _ from "underscore";

import {Template} from "meteor/templating";

Template.audioForm.helpers({
    audioType() {
        return Template.instance().audioType.get();
    }
});

Template.audioForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(3),
                page = session.page.get(),
                split = target.name.split('.'),
                property = split[1],
                type = split[0],
                stages = session.stages.get();

            switch (property) {
                case 'delay':
                case 'duration':
                    stages[page][this.index][property] = value;
                    session.stages.set(stages);
                    break;
                case 'frequency':
                    stages[page][this.index][type][property] = value;
                    session.stages.set(stages);
                    break;
            }
            console.log(stages, page, this.index, value);
        }
    }
});

Template.audioForm.onCreated(function () {
    const properties = _.pick(this.data, 'file', 'noise', 'wave'),
        type = _.keys(properties)[0];

    this.audioType = new ReactiveVar(type);
    this.defaults = _.defaults(properties, {
        file: {
            name: 'Beep',
            source: '/audio/beep.wav',
            type: 'wav'
        },
        wave: {
            frequency: 600
        }
    });
    console.log(properties, type);
});

Template.audioForm.onRendered(function () {
    const form = Template.instance();
    console.log(form, form.parent(3));

    $('.audio-type.ui.dropdown').dropdown({
        action: 'activate',
        onChange: (value) => {
            const session = form.parent(3),
                page = session.page.get(),
                stages = session.stages.get();

            stages[page][form.data.index][value] = form.defaults[value];
            form.defaults = _.defaults(_.pick(stages[page][form.data.index], value), form.defaults);
            form.audioType.set(value);
            session.stages.set(stages);
            console.log(stages, session.stages.get(), form, value);
        }
    });
});
