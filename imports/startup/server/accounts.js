import {Meteor} from 'meteor/meteor';

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
    if (type.password) {
        user.profile = {
            device: (profile.profile.device === 'device'),
            // TODO: Remove email field for box users
            email: profile.email,
            name: profile.profile.name,
            // TODO: Default profile picture
            username: profile.username
        }
    } else if (type.google) {
        user.profile = {
            device: false,
            email: type.google.email,
            name: profile.profile.name,
            picture: type.google.picture,
            username: type.google.email
        };
    }
    return user;
});

configureServices();
