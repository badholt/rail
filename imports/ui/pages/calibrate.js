import './calibrate.html';
import '/imports/ui/components/cross';
import '/imports/ui/components/dropdown/offset';

import { getContainer, renderCross } from '../components/cross';
import { ReactiveVar } from 'meteor/reactive-var';
import { Templates } from '../../api/collections';

Template.calibrate.helpers({
    preview(elements) {
        if (elements) {
            renderCross('#cross-preview', elements[ 'cross' ]);
            return elements[ 'cross' ];
        }
    }
});

Template.calibrate.onCreated(function () {
    this.autorun(() => {
        this.subscribe('users', { '_id': Meteor.userId(), 'profile.device': { $ne: false } });
        this.subscribe('users.user', 'cross');
    });
});

Template.calibrationView.onDestroyed(function () {
    const status = Meteor.user().status;
    if (status && !status.active.calibration) FlowRouter.go('/');
});

Template.audioCalibrationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#audio-calibration-form').form('get value', target.name));

        if (!_.isNaN(value)) {
            const settings = template.parent().settings.get();

            switch (target.name) {
                case 'frequency':
                case 'volume':
                    settings[ target.name ] = value;
                    break;
            }

            template.parent().settings.set(settings);
            Meteor.call('updateUser', template.parent(2).data.data._id, 'status.active.calibration', 'set', settings);
        }
    }
});

Template.audioCalibrationModal.helpers({
    settings() {
        return Template.instance().settings.get();
    }
});

Template.audioCalibrationModal.onCreated(function () {
    const calibration = this.data.profile.calibration;

    this.settings = new ReactiveVar((calibration.audio) ? calibration.audio : {
        'frequency': 0,
        'volume': 0
    });
});

Template.audioCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
    settings = Template.instance().settings;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() {
                Meteor.call('updateUser', device.data._id, 'profile.calibration.audio', 'set', settings.get());
            },
            onShow: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', { audio: settings.get() });
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrating.set({ profile: device.data.profile, window: '' });
            }
        })
        .modal('show');
});


Template.screenCalibrationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const elements = template.parent().elements.get(),
            offsets = template.parent().offsets.get(),
            preview = template.parent().preview.get(),
            n = 'cross';

            switch (target.name) {
                case 'span':
                case 'weight':
                    preview[ n ][ target.name ] = value;
                    template.parent().preview.set(preview);
                    break;
                case 'offset-x':
                case 'offset-y':
                    const name = target.name.split('-');

                    offsets[ n ][ name[ 0 ] ][ name[ 1 ] ] = value;
                    preview[ n ][ name[ 0 ] ][ name[ 1 ] ] = elements[ n ][ name[ 0 ] ][ name[ 1 ] ] + value;

                    template.parent().offsets.set(offsets);
                    template.parent().preview.set(preview);
                    break;
            }

            renderCross('#cross-preview', preview[n]);
            Meteor.call('updateUser', template.parent(4).data._id, 'status.active.calibration', 'set', preview);
        }
    }
});

Template.screenCalibrationForm.helpers({ // PREVIEW IS DATA CONTEXT
    offsets(type) { // FILTERS TO OFFSET ONLY
        const offsets = Template.instance().parent().offsets.get();
        if (offsets.hasOwnProperty(type)) return offsets[type];
    }
});

Template.screenCalibrationModal.helpers({
    preview(type) {
        return Template.instance().preview.get()[type];
    },
    screen() {
        return Template.instance().screen.get();
    }
});

Template.screenCalibrationModal.onCreated(function () {
    const calibration = this.data.profile.calibration,
        defaults = {
            cross: {
                offset: {
                    x: 0.0,
                    y: 0.85
                },
                span: 60,
                weight: 18
            }
        };

    // Tracks template version of elements
    this.elements = new ReactiveVar(defaults);
    // Tracks final saved offsets from template version
    this.offsets = new ReactiveVar((calibration.screen.cross) ? calibration.screen : {
        cross: { offset: { x: 0.0, y: 0.0 } }
    });
    // Tracks version of elements visually presented in calibration view
    this.preview = new ReactiveVar(defaults);

    // Combines template elements w/ temporary offsets for preview
    _.each(this.offsets.get(), (o) => {
        if (o.offset) {
            const p = this.preview.get();
            _.each(o.offset, (v,k) => (p[ 'cross' ][ 'offset' ][ k ] += v));
        }
    });

    this.screen = new ReactiveVar({
        height: calibration.screen.dimensions.height + "px",
        width: calibration.screen.dimensions.width + "px"
    });
});

Template.screenCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
        elements = Template.instance().elements,
        offsets = Template.instance().offsets,
        preview = Template.instance().preview;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() { // TODO To save or not to save span & weight?
                Meteor.call('updateUser', device.data._id, 'profile.calibration.screen.cross', 'set', offsets.get()[ 'cross' ]);
            },
            onShow: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', preview.get());
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrating.set({ profile: device.data.profile, window: '' });
            }
        })
        .modal('show');
});

Template.waterCalibrationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#water-calibration-form').form('get value', target.name));

        if (!_.isNaN(value)) {
            const settings = template.parent().settings.get();

            switch (target.name) {
                case 'amount':
                case 'dispense':
                case 'intercept':
                case 'slope':
                    settings[ target.name ] = value;
                    break;
            }

            template.parent().settings.set(settings);
            Meteor.call('updateUser', template.parent(2).data.data._id, 'status.active.calibration', 'set', settings);
        }
    }
});

Template.waterCalibrationModal.helpers({
    settings() {
        return Template.instance().settings.get();
    }
});

Template.waterCalibrationModal.onCreated(function () {
    const calibration = this.data.profile.calibration;

    this.settings = new ReactiveVar((calibration.water) ? calibration.water : {
        'amount': 0,
        'intercept': 0.0687, // Original water curve value, tailored to best-fit Box 3
        'dispense': 0,
        'slope': 5.57 // Original water curve value, tailored to best-fit Box 3
    });
});

Template.waterCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
    settings = Template.instance().settings;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() {
                Meteor.call('updateUser', device.data._id, 'profile.calibration.water', 'set', settings.get());
            },
            onShow: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', { water: settings.get() });
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrating.set({ profile: device.data.profile, window: '' });
            }
        })
        .modal('show');
});
