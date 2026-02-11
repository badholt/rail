import './cross.html';
import '/imports/ui/components/cross';

import _ from 'underscore';

import { ReactiveVar } from 'meteor/reactive-var';
import { getContainer, renderCross } from '../cross';
import { Template } from 'meteor/templating';

Template.crossForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($(`#${ target.form.id }`).form('get value', target.name));

        if (_.isNaN(value)) return;

        const session = template.parent(5),
            page = session.page.get(),
            stages = session.stages.get();

        switch (target.name) {
            case 'delay':
            case 'duration':
            case 'span':
            case 'weight':
                stages[ page ][ template.data.i ][ target.name ] = value;
                break;
            case 'offset-x':
            case 'offset-y': {
                const name = target.name.split('-');

                stages[ page ][ template.data.i ][ name[ 0 ] ][ name[ 1 ] ] = value;
                break;
            }
        }

        session.stages.set(stages);
        renderCross(this, '#cross-preview');
    }
});

Template.crossForm.helpers({
    visible() {
        return Template.instance().get('opened').get();
    }
});

Template.crossPreview.helpers({
    preview(cross) {
        const preview = _.extend(cross, { preview: true }),
            template = Template.instance();

        if (!_.isEqual(preview, template.cross.get())) {
            const dimensions = getContainer('#cross-preview'),
                valid = dimensions.height > 0 && dimensions.width > 0;

            if (valid) {
                template.cross.set(preview);
                template.screen.set(dimensions);
                renderCross(preview, '#cross-preview');
            }
        }

        return preview;
    },
    screen() {
        return Template.instance().screen.get();
    }
});

Template.crossPreview.onCreated(function () {
    this.cross = new ReactiveVar({});
    this.screen = new ReactiveVar({});
});
