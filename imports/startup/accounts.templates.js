import {Accounts} from 'meteor/accounts-base';
import {AccountsTemplates} from 'meteor/useraccounts:core';

const pwd = AccountsTemplates.removeField('password');

AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
    {
        _id: 'device',
        type: 'radio',
        displayName: 'Account Type',
        required: true,
        select: [
            {
                text: 'This account will be assigned to a training box.',
                value: 'device',
            }, {
                text: 'This account will be assigned to an experimenter.',
                value: 'user',
            }
        ],
    },
    {
        _id: 'username',
        type: 'text',
        displayName: 'username',
        required: true,
        minLength: 5,
    },
    {
        _id: 'email',
        type: 'email',
        required: false,
        displayName: 'email',
        re: /.+@(.+){2,}\.(.+){2,}/,
        errStr: 'Invalid email',
    },
    pwd
]);

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    overrideLoginErrors: false,
    lowercaseUsername: true,
    focusFirstInput: true,
    sendVerificationEmail: true,
    socialLoginStyle: "redirect",

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

    // Routing
    defaultLayoutType: 'blaze',
    defaultTemplate: 'home',
    defaultLayout: 'frame',
    defaultLayoutRegions: {},
    defaultContentRegion: 'main'
});

Accounts.onLoginFailure(function (error) {
    console.log(error);
});
