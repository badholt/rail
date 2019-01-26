import './authorized.html';

import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.authorizedDropdown.helpers({
    authorized() {
        return _.contains(this.profile.experiments, Template.instance().data._id);
    },
    user() {
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
