import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.profileAvatar.helpers({
    user(id) {
        return Meteor.users.findOne(id);
    }
});
