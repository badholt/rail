import {Accounts} from 'meteor/accounts-base';

Accounts.ui.config({
    requestPermissions: {
        google: ['email','user','userinfo']
    },
    requestOfflineToken: {
        google: true
    },
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});
