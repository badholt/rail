import './admin.html';
import './forms/user';

import { Experiments } from '../../api/collections';
import { getInitials } from './profile';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.adminPanel.helpers({
  devices() {
    return Meteor.users.find(
        { 'profile.device': { $type: 'string' }, 'status.client': { $ne: {} } },
        { fields: { 'profile.name': 1, 'status.client': 1 } }
    ).fetch();
  }
});

Template.adminPanel.onRendered(function () {
    this.autorun(() => {
        if (!Meteor.user()?.device) {
            this.subscribe('users', { 'profile.device': { $type: 'string' }, 'status.client': { $ne: {} } });
            Meteor.call('getClients');
        }
    });
});

Template.clientList.events({
    'click .button[id^=connect]'(e) {
        const id = e.target.value;

        Meteor.call('updateClient', id, 'connect');
        Meteor.call('getClients');
    },
    'click .button[id^=disconnect]'(e) {
        const id = e.target.value;

        Meteor.call('updateClient', id, 'end');
        Meteor.call('getClients');
    }
});

Template.clientList.helpers({
    clients(devices) {
        return _.values(devices);
    }
});

Template.experimentList.helpers({
    authorized(experiments) {
        return Experiments.find({ _id: { $in: experiments } });
    }
});

Template.experimentItem.events({
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
        .catch(error => console.log(error)));
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
