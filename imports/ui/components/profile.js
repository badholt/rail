import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

Template.profileAvatar.helpers({
    user(id) {
        console.log(id);
        return Meteor.users.findOne(id);
    }
});
