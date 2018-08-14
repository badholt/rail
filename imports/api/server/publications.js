import {Meteor} from 'meteor/meteor';
import {Experiments, Sessions, Trials} from "/imports/api/collections";

Meteor.publish('experiments', function () {
    return Experiments.find();
});
Meteor.publish('experiments.single', function (id) {
    return Experiments.find(id);
});
Meteor.publish('experiments.user', function (id) {
    return Experiments.find({users: {$elemMatch: {$eq: id}}});

});

Meteor.publish('sessions.device', function (address) {
    return Sessions.find({device: address});
});
Meteor.publish('sessions.experiment', function (id) {
    return Sessions.find({experiment: id});
});
Meteor.publish('sessions.single', function (id) {
    return Sessions.find(id);
});

Meteor.publish('trials.experiment', function (id) {
    return Trials.find({experiment: id});
});
Meteor.publish('trials.single', function (id) {
    return Trials.find({session: id});
});

Meteor.publish('users', function (params) {
    return Meteor.users.find(params, {fields: {profile: 1, status: 1}});
});
