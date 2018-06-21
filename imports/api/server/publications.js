import {Meteor} from 'meteor/meteor';
import {Experiments, Sessions, Trials} from "/imports/api/collections";

Meteor.publish('experiments', function () {
    return Experiments.find();
});
Meteor.publish('experiments.single', function (id) {
    return Experiments.find(id);
});
Meteor.publish('experiments.user', function () {
    return Experiments.find();
});

Meteor.publish('sessions', function (id) {
    return Sessions.find({experiment: id});
});
Meteor.publish('sessions.single', function (id) {
    return Sessions.find(id);
});

Meteor.publish('trials', function (id) {
    return Trials.find({experiment: id});
});
Meteor.publish('trials.single', function (id) {
    return Trials.find({session: id});
});
