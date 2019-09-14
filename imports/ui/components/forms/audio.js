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
    const audio = _.clone(this.data.element.source);

    this.audioType = new ReactiveVar(audio.type);
    this.defaults = _.defaults(audio, {
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
        session = form.parent(5);
    console.log('AUDIO FORM:\t', form);
    console.log('SESSION:\t', session);
    console.log('DEFAULTS:\t', form.defaults);

    $('.audio-type.ui.dropdown').dropdown({
        action: 'activate',
        onChange: (value) => {
            const stages = session.stages.get();

            /** Fill new audio form with saved settings: */
            stages[form.data.page][form.data.i].source = {
                [value]: form.defaults[value],
                type: value
            };

            /** Update defaults with user configured settings: **/
            // form.defaults = _.defaults(audio, form.defaults);
            form.audioType.set(value);
            session.stages.set(stages);
        }
    });
});

Template.audioNoise.onRendered(function () {
    const element = Template.parentData(2),
        session = Template.instance().parent(6);

    this.$('.noise.dropdown').dropdown({
        onChange: (value) => {
            const stages = session.stages.get();
            stages[element.page][element.i].source.noise.type = value;
        }
    });
});
