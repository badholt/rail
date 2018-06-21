import {Mongo} from 'meteor/mongo';

export const Experiments = new Mongo.Collection('experiments');
export const Sessions = new Mongo.Collection('sessions');
export const Trials = new Mongo.Collection('trials');
