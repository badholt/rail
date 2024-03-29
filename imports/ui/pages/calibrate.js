import './calibrate.html';
import '/imports/ui/components/cross';
import '/imports/ui/components/dropdown/offset';

import {getContainer, renderCross} from '../components/cross';
import {ReactiveVar} from 'meteor/reactive-var';
import {Templates} from '../../api/collections';

Template.calibrate.helpers({
    elements(elements) {
    	if (elements) {
            renderCross('#cross-preview', elements['cross']);
            return elements['cross'];
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
            n = 'cross';

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
    element(template) {console.log(template);
        let current = Template.instance().elements.get()['cross'];

        /*if (template) {
            const def = _.find(_.flatten(template.stages), (element) => (element.type === 'cross'));

            if (def) {
                current = {
                    "offset": {
                        "x": def.offset.x + current.offset.x,
                        "y": def.offset.y + current.offset.y
                    },
                    "span": 75,
                    "weight": 10
                };console.log(def, current);
            }
        }*/ // TODO: Move out of helper to intialize & onChange

        return current;
    },
    screen() {
        return Template.instance().screen.get();
    },
    template() {
        const templateId = Template.instance().templateId.get(),
        id = Template.instance().cipher[templateId];console.log(Template.instance(), templateId, id);

        return Templates.findOne({"_id": id});
    }
});

Template.screenCalibrationModal.onCreated(function () {
    const calibration = this.data.profile.calibration;
    this.cipher = {}; // For dropdown decryption
    this.elements = new ReactiveVar((calibration.screen) ? calibration.screen : {cross: {
        "offset": {
            "x": 0,
            "y": 0.75
        },
        "span": 75,
        "weight": 10
    }});
    this.screen = new ReactiveVar({height: "480px", width: "800px"});
    this.templateId = new ReactiveVar("");
});

Template.screenCalibrationModal.onRendered(function () {
    const device = Template.instance().parent(3),
    elements = Template.instance().elements;

    this.$('[id^=modal-calibrate-]')
        .modal({
            context: '#main-panel',
            onApprove: function() {
                Meteor.call('updateUser', device.data._id, 'profile.calibration.screen.cross', 'set', elements.get()['cross']);
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

    renderCross('#cross-preview', _.extend(elements.get()['cross'], {"preview": true, "type": "cross"}));
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
        "amount": 0,
        "intercept": 0.0687, // Original water curve value, tailored to best-fit Box 3
        "dispense": 0,
        "slope": 5.57 // Original water curve value, tailored to best-fit Box 3
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
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', {water: settings.get()});
            },
            onHidden: function() {
                Meteor.call('updateUser', device.data._id, 'status.active.calibration', 'set', false);
                device.calibrating.set(false);
            }
        })
        .modal('show');
});
