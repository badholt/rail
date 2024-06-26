import {Meteor} from 'meteor/meteor';
import {UserStatus} from 'meteor/mizzao:user-status';

const services = Meteor.settings.private.oAuth,
    configureServices = () => {
        if (services) {
            for (let service in services) {
                if (services.hasOwnProperty(service)) {
                    ServiceConfiguration.configurations.upsert({service: service}, {
                        $set: services[service]
                    });
                }
            }
        }
    };

Accounts.onCreateUser(function (profile, user) {
    const type = user.services;

    if ('device' !== profile.profile.device) {
        user.profile = {
            device: false,
            email: profile.email || (type.google || {}).email || '',
            name: profile.profile.name,
            picture: (type.google || {}).picture || '',
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

//TODO: Perhaps add a separate setup screen for running code on online boxes
UserStatus.events.on('connectionLogin', function (fields) {
    const user = Meteor.users.findOne(fields.userId);

    if (user.profile.device) {
        if (user.profile.address !== fields.ipAddr || user.profile.device !== fields.userAgent) {
            Meteor.users.update(fields.userId, {$set: {'profile.address': fields.ipAddr}});
            Meteor.users.update(fields.userId, {$set: {'profile.device': fields.userAgent}});
        }
    }
});
