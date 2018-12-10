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

    if ('device' !== profile.profile.device) {
        user.profile = {
            device: false,
            email: profile.email || type.google.email || '',
            name: profile.profile.name,
            picture: (type.google) ? type.google.picture : '',
            username: profile.username || type.google.email
        };
    } else {
        user.profile = {
            address: '127.0.0.1',
            device: true,
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
        if (user.profile.address !== fields.ipAddr) {
            //TODO: Create popup & make IP address update optional
            console.log("You're logging in from " + fields.ipAddr + ", a different location than your previous login, "
                + user.profile.address + ".  Would you like to update your device settings?");
            Meteor.users.update(fields.userId, {$set: {'profile.address': fields.ipAddr}});
        }
    }
});
