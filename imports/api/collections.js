/**
 * api/collections.js
 *
 * Purpose:
 *  - Defines & exports MongoDB collections used across the application.
 *
 * Notes:
 *  - Shared client/server collections (Meteor minimongo sync)
 *  - No runtime initialization logic 
 * */

import { Mongo } from 'meteor/mongo';

export const Clients = new Mongo.Collection('clients'),
    Experiments = new Mongo.Collection('experiments'),
    Sessions = new Mongo.Collection('sessions'),
    Subjects = new Mongo.Collection('subjects'),
    Templates = new Mongo.Collection('templates'),
    Trials = new Mongo.Collection('trials');
