import './calibrate.html';
import '/imports/ui/components/cross';

import {getContainer, renderCross} from '../components/cross';

Template.calibrate.helpers({
    elements(elements) {
    	if (elements) {
            renderCross('#cross-preview', elements[0]);
            return elements[0];
        }
    }
});

Template.calibrate.onCreated(function () {
	this.autorun(() => this.subscribe('users', {'_id': Meteor.userId()}));
});

Template.calibrationView.onDestroyed(function () {
    const calibration = Meteor.user().status.active.calibration;
    if (!calibration) FlowRouter.go('/');
});

Template.screenCalibrationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#' + target.form.id).form('get value', target.name));

        if (!_.isNaN(value)) {
            const elements = template.parent().elements.get(),
            n = 0;

            switch (target.name) {
                case 'span':
                case 'weight':
                    elements[n][target.name] = value;
                    break;
                case 'offset-x':
                case 'offset-y':
                    const name = target.name.split('-');
                    elements[n][name[0]][name[1]] = value;
                    break;
            }

            template.parent().elements.set(elements);
            renderCross('#cross-preview', this);
            Meteor.call('updateUser', template.parent(2).data.data._id, 'status.active.calibration', 'set', elements);
        }
    }
});

Template.screenCalibrationModal.helpers({
    element() {
        return Template.instance().elements.get()[0];
    },
    screen() {
        return Template.instance().screen.get();
    }
});

Template.screenCalibrationModal.onCreated(function () {
    const calibration = this.data.profile.calibration;
    this.elements = new ReactiveVar((calibration.screen) ? calibration.screen : [{
        "delay": 0,
        "duration": 1000,
        "offset": {
            "x": 0,
            "y": 0.85
        },
        "preview": "true",
        "type": "cross",
        "span": 75,
        "weight": 10
    }]);
    this.screen = new ReactiveVar({height: "480px", width: "800px"});
});

Template.screenCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
    elements = Template.instance().elements;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() {
                Meteor.call('updateUser', device.data._id, 'profile.calibration.screen', 'set', elements.get());
            },
            onShow: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', elements.get());
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrating.set(false);
            }
        })
        .modal('show');

        renderCross('#cross-preview', Template.instance().elements.get()[0]);
});

Template.waterCalibrationForm.events({
    'input input'(event, template) {
        const target = event.target || event.srcElement,
            value = parseFloat($('#water-calibration-form').form('get value', target.name));

        if (!_.isNaN(value)) {
            const settings = template.parent().settings.get();

            switch (target.name) {
                case 'amount':
                case 'rate':
                    settings[target.name] = value;
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
        "amount": 0.001,
        "rate": 0.10
    });
});

Template.waterCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
    settings = Template.instance().settings;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() {console.log(device.data);
                Meteor.call('updateUser', device.data._id, 'profile.calibration.water', 'set', settings.get());
            },
            onShow: function() {console.log(device, settings.get());
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', settings.get());
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrate.set(false);
            }
        })
        .modal('show');
});
