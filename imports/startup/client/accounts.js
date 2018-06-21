import {Accounts} from 'meteor/accounts-base';
import {Meteor} from 'meteor/meteor';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
});

ServiceConfiguration.configurations.upsert(
    {service: 'google'},
    {
        $set: {
            loginStyle: '',
            clientId: Meteor.settings.private.oAuth.google.clientID,
            secret: Meteor.settings.private.oAuth.clientSecret
        }
    });

console.log(Meteor.settings.toString());
