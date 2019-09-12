import './audio.html';

import _ from "underscore";

import {Template} from "meteor/templating";

Template.audioForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const session = template.parent(5),
                page = session.page.get(),
                split = target.name.split('.'),
                property = split[1],
                type = split[0],
                stages = session.stages.get();

            switch (property) {
                case 'delay':
                case 'duration':
                    stages[page][template.data.i][property] = value;
                    session.stages.set(stages);
                    break;
                case 'frequency':
                    stages[page][template.data.i][type][property] = value;
                    session.stages.set(stages);
                    break;
            }
            console.log(stages, page, template, this, value);
        }
    }
});

Template.audioForm.helpers({
    audioType() {
        return Template.instance().audioType.get();
    },
    icon(type) {
        const icons = {
            file: 'blue file audio',
            noise: 'pink barcode',
            wave: 'green industry'
        };

        return icons[type];
    }
});

Template.audioForm.onCreated(function () {
    const types = ['file', 'noise', 'wave'],
        type = _.find(_.keys(this.data.element), (v) => _.contains(types, v));

    this.audioType = new ReactiveVar(type);
    this.defaults = _.defaults(this.data.element, {
        file: {
            name: 'Beep',
            source: '/audio/beep.wav',
            type: 'wav'
        },
        noise: {
            type: 'white'
        },
        wave: {
            frequency: 600,
            type: 'sine'
        }
    });
});

Template.audioForm.onRendered(function () {
    const form = Template.instance(),
        element = form.parent(3),
        session = element.parent(2);
    console.log('AUDIO FORM:\t', form);
    console.log('SESSION:\t', session);
    console.log('DEFAULTS:\t', form.defaults);

    $('.audio-type.ui.dropdown').dropdown({
        action: 'activate',
        onChange: (value) => {
            const page = session.page.get(),
                stages = session.stages.get();
            let audio = stages[page][element.data.i];

            form.defaults = _.defaults(audio, form.defaults);
            audio = _.omit(audio, 'file', 'noise', 'wave');
            audio[value] = form.defaults[value];
            console.log(3, audio, form.defaults);
            stages[page][element.data.i] = audio;
            form.audioType.set(value);
            session.stages.set(stages);
        }
    });
});

Template.audioNoise.onRendered(function () {
    const form = Template.instance(),
        element = form.parent(4),
        session = element.parent(2);

    this.$('.noise.dropdown').dropdown({
        onChange: (value) => {
            const page = session.page.get(),
                stages = session.stages.get();
            let n = stages[page][element.data.i]['noise.type'];
            console.log(n, value);
            n = value;
            console.log(n, value);
        }
    });
});
