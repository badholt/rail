import './profile.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

export const getInitials = (name) => ((Meteor.settings?.public?.defaults?.avatars)
    ? `${ Meteor.settings.public.defaults.avatars }${ name?.replace(' ', '+') }` : '');

Template.profileAvatar.helpers({
    img(picture, name) {
        return (picture) ? picture : getInitials(name);
    },
    user(id) {
        return Meteor.users.findOne(id);
    }
});
