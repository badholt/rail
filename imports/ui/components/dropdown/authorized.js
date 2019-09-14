import './authorized.html';

import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.authorizedDropdown.helpers({
    authorized(profile) {
        return _.contains(profile.experiments, Template.instance().data._id);
    },
    user(users) {
        return Meteor.users.find({_id: {$in: users}});
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
