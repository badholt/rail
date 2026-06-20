/**
 * imports/startup/server/fixtures.js
 *
 * Purpose:
 *  - Initializes server environment, patches user state, & seeds default data
 *
 * Notes:
 *  - Runs on Meteor startup
 *  - Configures CORS & runtime environment
 * */

import '/imports/api/server.methods';

import { Meteor } from 'meteor/meteor';
import { Templates } from '/imports/api/collections';
import { templates } from './templates.js';

Meteor.startup(() => {
    process.env.ROOT_URL = 'http://redirect.railpage.org';

    /** Enable CORS: */
    WebApp.rawConnectHandlers.use((_req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");

        return next();
    });

    Meteor.users.find().forEach((user) => {
        if (user.profile.device && !user.status?.session) Meteor.users.update({ _id: user._id }, {
            $set: {
                'status.active.session': { pointer: 0, queue: [], updatedAt: new Date() }
            }
        });
    });

    if (Templates.find().count() === 0) _.each(templates, (template) => Meteor.call('addTemplate', template));
});
