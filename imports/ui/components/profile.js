import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";

Template.profileAvatar.helpers({
    user(id) {
        return Meteor.users.findOne(id);
    }
});
