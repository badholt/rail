import '/imports/api/server.methods';

import { Meteor } from 'meteor/meteor';
import { templates } from './templates.js';
import { Templates } from '/imports/api/collections';

Meteor.startup(() => {
    process.env.ROOT_URL = 'http://redirect.railpage.org';

    /** Enable CORS: */
    WebApp.rawConnectHandlers.use((_req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
      return next();
    });

    Meteor.users.find().forEach((user) => {
        if (user.profile.device) Meteor.users.update({ _id: user._id }, {
            $set: { 'status.client': {} }
        });
    });

    if (Templates.find().count() === 0) {
        _.each(templates, (template) => Meteor.call('addTemplate', template));
    }
});
