import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/mizzao:user-status';

const services = Meteor.settings.private.oAuth,
    configureServices = () => {
        if (!services) return;

        for (const service in services) {
            if (!_.has(services, 'service')) continue;

            ServiceConfiguration.configurations.upsert({ service: service },
                { $set: services[ service ] });
        }
    };

Accounts.onCreateUser((profile, user) => {
    const type = user.services;

    if ('device' !== profile.profile.device) {
        user.profile = {
            device: false,
            email: profile.email || type.google?.email || '',
            experiments: [],
            name: profile.profile.name,
            picture: type.google?.picture || '',
            username: profile.username || type.google.email
        };
    } else {
        user.profile = {
            address: '127.0.0.1',
            calibration: { screen: { dimensions: { height: 480, width: 800 } } },
            components: [],
            device: true,
            logging: { audio: false, mqtt: false, session: false, sensors: false, timers: false, trials: false },
            name: profile.profile.name,
            username: profile.username || type.google.email
        }
    }
    return user;
});

configureServices();

UserStatus.events.on('connectionLogin', (fields) => {
    const user = Meteor.users.findOne(fields.userId);

    if (user.profile.device) {
        if (user.profile.address !== fields.ipAddr || user.profile.device !== fields.userAgent) {
            Meteor.users.update(fields.userId, { $set: { 'profile.address': fields.ipAddr } });
            Meteor.users.update(fields.userId, { $set: { 'profile.device': fields.userAgent } });
        }
    }
});
