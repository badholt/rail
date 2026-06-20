/**
 * imports/ui/components/admin.js
 *
 * Purpose:
 *  - Admin dashboard for managing clients, experiments, & user state
 *  - Displays MQTT client status & controls lifecycle actions
 * */

import './admin.html';
import './forms/experiment';
import './forms/user';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import { Clients, Experiments } from '/imports/api/collections';
import { createClient, mqttSend } from '/imports/services/mqtt';
import { getInitials } from './profile';

export const submitExperimentUpdate = (exp) => {
        const form = $('#experiment-form').form('get values');

        /** Do not update if unchanged: */
        if (_.isMatch(exp, form)) return;

        Meteor.callAsync('getExperimentLink', form.link).then((link) =>
            Meteor.callAsync('updateExperiment', exp._id, (exp.link !== form.link)
                ? _.assign(form, { link }) : form));
    };

const CLIENT_STATUS_CONFIG = {
    busy: {
        actions: 'loading notched',
        color: 'yellow',
        icon: 'random',
        message: 'In progress: ',
        tooltip: 'Started task ',

        params: (context) => `${ context.task }`
    },
    degraded: {
        actions: '',
        color: 'olive',
        icon: 'battery quarter'
    },
    draining: {
        actions: 'loading notched',
        color: 'green',
        icon: 'tasks',
        message: 'Finishing remaining tasks...',
        tooltip: 'Clearing task queue since '
    },
    error: {
        actions: 'warning',
        color: 'red',
        icon: 'code',
        message: 'Error: ',
        tooltip: 'Crashed ',

        params: (context) => `${ context.error }`
    },
    idle: {
        actions: '',
        color: 'green',
        icon: ''
    },
    maintenance: {
        actions: 'loading notched',
        color: 'grey',
        icon: 'tools',
        message: 'In progress: ',
        tooltip: 'Performing maintenance since ',

        params: (context) => `${ context.task }`
    },
    offline: {
        actions: '',
        color: 'red',
        icon: ''
    },
    paused: {
        actions: 'pause',
        color: 'grey',
        icon: ''
    },
    suspended: {
        actions: 'pause',
        color: 'orange',
        icon: ''
    }
};

Template.adminPanel.helpers({
    clients() {
        return Clients.find();
    }
});

Template.adminPanel.onRendered(function () {
    this.autorun(() => { this.subscribe('clients'); });
    this.autorun(() => {
        const user = Meteor.user();
        if (!user?.device) this.subscribe('users', { 'profile.device': { $type: 'string' } });
    });
});

Template.clientList.events({
    'click .button[id^=connect]'(e) {
        const id = e.target.value;
        createClient(id);
    },
    'click .button[id^=disconnect]'(e) {
        const id = e.target.value;
        mqttSend(`hub/${ id }/command`, { command: 'disconnect' });
    }
});

Template.clientList.helpers({
    'clientStatus'(state, props) {
        const config = CLIENT_STATUS_CONFIG[ state ] || {},
            classes = _.map((props || '').split(","), p => typeof config[ p ] === 'function'
                ? config[ p ](this)
                : config[ p ] || '');

        return `${ classes.join(' ') } `;
    },
    'disabled'(state) {
        const disabled = [ 'busy', 'draining', 'error', 'maintenance' ];
        return disabled.includes(state);
    }
});

Template.experimentItem.events({
    'click a.edit'(_event, template) {
        const editing = template.get('editing');

        editing.set(template.data);
        $('[id^=modal-experiment-]').modal('show');
    },
    'click a.visibility'(_event, template) {
        const id = template.data._id,
            user = Meteor.user();

        Meteor.callAsync('updateUser', user._id, 'profile.hidden',
            !_.contains(user.profile?.hidden, id) ? 'push' : 'pull', id);
    }
});

Template.experimentItem.helpers({
    hidden(id) {
        return _.contains(Meteor.user().profile?.hidden, id);
    }
});

Template.experimentList.helpers({
    authorized(experiments) {
        return Experiments.find({ _id: { $in: experiments } });
    },
    editing() {
        return Template.instance().editing.get();
    }
});

Template.experimentList.onCreated(function () { this.editing = new ReactiveVar(false); });

Template.experimentModal.onRendered(function () {
    const editing = this.get('editing'),
        editExperiment = (editing) => ({
            allowMultiple: true,
            closeIcon: true,
            context: '.ui.right.floated.segment',
            onApprove: () => submitExperimentUpdate(editing.get()),
            onDeny: () => {
                confirmDelete(editing.get());
                return false; // Prevent nested modals from flashing
            }
        }),
        confirmDelete = (exp) => $.modal({
            allowMultiple: true,
            title: `Please Confirm Deletion of "${ exp.title }"`,
            class: 'ui compact inverted negative message',
            classActions: 'basic',
            classContent: 'center aligned',
            classTitle: 'ui centered inverted red',
            context: '.ui.right.floated.segment',
            content: `Once deleted, experiment "${ exp.title }" will be unrecoverable.`,
            inverted: true,
            actions: [
                {
                    class: 'red',
                    icon: 'exclamation triangle',
                    text: 'Delete',
                    click: () => Meteor.callAsync('removeExperiment', exp._id).then(() => $.toast({
                        class: 'success centered',
                        message: `Experiment & All references to "${ exp.title }" have been removed.`,
                        position: 'bottom attached',
                        showIcon: 'trash',
                        title: `Deletion Success`
                    }))
                },
                {
                    class: 'icon',
                    icon: 'undo',
                    click: () => $('[id^=modal-experiment-]').modal('show')
                }
            ]
        }).modal('show');

    this.$('[id^=modal-experiment-]').modal(editExperiment(editing));
});

Template.userCard.events({
    'change #upload-file'(event, template) {
        const target = event.target || event.srcElement;
        template.loadPic(_.first(target.files));
    },
    'change #upload-url'(event, template) {
        const target = event.target || event.srcElement,
            url = $(target).val();
        
        template.isPic(url);
    },
    'click #edit-user'(_event, template) {
        const prev = template.edit.get();

        template.edit.set(!prev);
        $('label.image').dimmer((prev) ? 'destroy' : { on: 'hover' });
    },
    'click #delete-pic'(_event, template) {
        template.previewPic('');
    }
});

Template.userCard.helpers({
    edit() {
        return Template.instance().edit.get();
    },
    img(name) {
        const avatar = Template.instance().picture.get();
        return (avatar) ? avatar : getInitials(name);
    }
});

Template.userCard.onCreated(function () {
    this.edit = new ReactiveVar(false);
    this.picture = new ReactiveVar(false);

    this.isPic = (url) => (fetch(url, { method: 'HEAD' })
        .then(result => {
            if (!result.ok) Promise.reject(result);

            const img = result.headers.get('Content-Type').startsWith('image');

            if (!img) return $.toast({
                title: 'Invalid URL',
                message: `${ url } is not an image url.`,
                class : 'error',
                showIcon: 'cancel',
                showProgress: 'bottom'
            });

            return this.previewPic(url);
        })
        .catch(error => console.error(error)));
    this.loadPic = (img) => {
        const fileReader = new FileReader();

        fileReader.onloadend = (event) => {
            if (event.target.result) this.previewPic(event.target.result);
        };

        fileReader.readAsDataURL(img);
    };
    this.previewPic = (img) => {
        this.picture.set(img);
        $('#user-form').form('set value', 'picture', img);
    };
});

Template.userCard.onRendered(() => {
    $('label.ui.image').dimmer('hide');

    const template = Template.instance();
    template.picture.set(template.data.profile.picture);
});
