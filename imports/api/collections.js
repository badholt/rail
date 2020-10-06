/**
 * api/collections.js
 *
 * Description:
 *  Creates data collections for database organization
 * * * * * * * */

import {Mongo} from 'meteor/mongo';

export const Experiments = new Mongo.Collection('experiments');
export const Sessions = new Mongo.Collection('sessions');
export const Subjects = new Mongo.Collection('subjects');
export const Templates = new Mongo.Collection('templates');
export const Trials = new Mongo.Collection('trials');
