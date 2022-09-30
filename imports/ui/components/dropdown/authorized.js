import './authorized.html';

import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.authorizedDropdown.helpers({
    authorized(id) {
        return _.contains(Template.instance().data.users, id);
    },
    user(users) {
        return Meteor.users.find({'profile.device': false});
    }
});

Template.authorizedDropdown.onCreated(function () {
    this.autorun(() => {
        this.subscribe('users', {'profile.device': false});
    });
});

Template.authorizedDropdown.onRendered(function () {
    $('#authorized').dropdown();
});
