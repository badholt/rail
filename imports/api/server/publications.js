/**
 * api/server/publications.js
 *
 * Description:
 *  Defines publication tiers, which determine what data is exposed within data collections
 * * * * * * * */

import {Meteor} from 'meteor/meteor';
import {Experiments, Sessions, Subjects, Templates, Trials} from '/imports/api/collections';

/**
 * Experiments Collection
 *
 * Returns:
 *  (1) all experiments
 *  (2) a single experiment by experiment id
 *  (3) experiments including a subject by subject id
 *  (4) experiments belonging to a user by user id */
Meteor.publish('experiments', () => Experiments.find());
Meteor.publish('experiments.single', (id) => Experiments.find(id));
Meteor.publish('experiments.subject', (id) => {
    const experiments = Subjects.findOne(id).experiments;
    return Experiments.find({_id: {$in: experiments}});
});
Meteor.publish('experiments.user', (id) => Experiments.find({users: {$elemMatch: {$eq: id}}}));

/**
 * Sessions Collection
 *
 * Returns:
 *  (1) sessions including a device by device id
 *  (2) sessions belonging to an experiment by experiment id,
 *  (3) a single session by session id */
Meteor.publish('sessions.device', (id) => Sessions.find({device: id}));
Meteor.publish('sessions.experiment', (id, fields, limit, skip) => Sessions.find({experiment: id}, {
    fields: fields,
    sort: {lastModified: -1},
    skip: skip,
    limit: limit
}));
Meteor.publish('sessions.single', (id) => Sessions.find(id));
Meteor.publish('sessions.today', (date, id) => Sessions.find({date: {$gt: date}, device: id}));

/**
 * Subjects Collection
 *
 * Returns:
 *  (1) all subjects
 *  (2) subjects included in an experiment by experiment id */
Meteor.publish('subjects', () => Subjects.find());
Meteor.publish('subjects.experiment', (id) => Subjects.find({experiments: {$elemMatch: {$eq: id}}}));
Meteor.publish('subjects.session', (ids) => Subjects.find({_id: {$in: ids}}));
Meteor.publish('subjects.user', (id) => Subjects.find({users: {$elemMatch: {$eq: id}}}));

/**
 * Templates Collection
 *
 * Returns:
 *  (1) all templates
 *  (2) templates associated w/an experiment by experiment id, and public or private templates belonging to a user by user id TODO: Remove redundancy?
 *  (3) public templates, or all private templates belonging to a user by user id */
Meteor.publish('templates', () => Templates.find());
Meteor.publish('templates.experiment', (experiment, user) => {
    // const experiment = Experiments.findOne(id);
    if (experiment) return Templates.find({
        $and: [{_id: {$in: experiment.templates}},
            {$or: [{author: user}, {users: {$elemMatch: {$eq: 'any'}}}, {users: {$elemMatch: {$eq: user}}}]}]
    });
});
Meteor.publish('templates.user', (id) => Templates.find({$or: [{users: {$elemMatch: {$eq: 'any'}}}, {users: {$elemMatch: {$eq: id}}}]}));

/**
 * Trials Collection
 *
 * Returns:
 *  (1) trials belonging to an experiment by experiment id
 *  (2) trials belonging to a session by session id*/
Meteor.publish('trials.experiment', (id) => Trials.find({experiment: id}));
Meteor.publish('trials.session', (id) => Trials.find({session: id}, {sort: {number: -1}}));

/**
 * Users Collection
 *
 * Returns:
 *  (1) user profile(s) and status(es) within requested parameters TODO: Reduce security gap */
Meteor.publish('users', (params) => Meteor.users.find(params, {fields: {lastModified: 1, profile: 1, status: 1}}));
