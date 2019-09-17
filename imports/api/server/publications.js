import {Meteor} from 'meteor/meteor';
import {Experiments, Sessions, Subjects, Templates, Trials} from '/imports/api/collections';

Meteor.publish('experiments', function () {
    return Experiments.find();
});
Meteor.publish('experiments.single', function (id) {
    return Experiments.find(id);
});
Meteor.publish('experiments.subject', function (id) {
    const experiments = Subjects.findOne(id).experiments;
    return Experiments.find({_id: {$in: experiments}});
});
Meteor.publish('experiments.user', function (id) {
    return Experiments.find({users: {$elemMatch: {$eq: id}}});

});

Meteor.publish('sessions.device', function (id) {
    return Sessions.find({device: id});
});
Meteor.publish('sessions.experiment', function (id, fields) {
    return Sessions.find({experiment: id}, {fields: fields});
});
Meteor.publish('sessions.single', function (id) {
    return Sessions.find(id);
});

Meteor.publish('subjects', function () {
    return Subjects.find();
});
Meteor.publish('subjects.experiment', function (id) {
    return Subjects.find({experiments: {$elemMatch: {$eq: id}}});
});

Meteor.publish('templates', function () {
    return Templates.find();
});
Meteor.publish('templates.experiment', function (id, user) {
    const experiment = Experiments.findOne(id);
    if (experiment) return Templates.find({
        $and: [{_id: {$in: experiment.templates}},
            {$or: [{users: 'any'}, {users: {$elemMatch: {$eq: user}}}]}]
    });
});
Meteor.publish('templates.user', function (id) {
    return Templates.find({$or: [{users: 'any'}, {users: {$elemMatch: {$eq: id}}}]});
});

Meteor.publish('trials.experiment', function (id) {
    return Trials.find({experiment: id});
});
Meteor.publish('trials.session', function (id) {
    return Trials.find({session: id});
});

Meteor.publish('users', function (params) {
    return Meteor.users.find(params, {fields: {lastModified: 1, profile: 1, status: 1}});
});
