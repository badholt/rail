import {AccountsTemplates} from 'meteor/useraccounts:core';
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

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    overrideLoginErrors: true,
    lowercaseUsername: true,
    focusFirstInput: true,
    sendVerificationEmail: true,

    // Appearance
    showAddRemoveServices: true,
    showForgotPasswordLink: false,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: true,

    // Client-side Validation
    continuousValidation: true,
    negativeFeedback: true,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Redirects
    homeRoutePath: '/',
    redirectTimeout: 4000,

    // Texts
    texts: {
        button: {
            signUp: "Register Now!"
        },
        socialSignUp: "Register",
        title: {
            forgotPwd: "Recover Your Password"
        },
    },
});

Accounts.onCreateUser(function (profile, user) {
    profile.profile.picture = user.services.google.picture;
    return profile;
});

configureServices();
