import { Accounts } from 'meteor/accounts-base';
import { AccountsTemplates } from 'meteor/useraccounts:core';

AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');

AccountsTemplates.addFields([
    {
        _id: 'device',
        type: 'radio',
        displayName: 'Account Type',
        required: true,
        select: [
            {
                text: 'Training Box',
                value: 'device',
            }, {
                text: 'Experimenter',
                value: 'user',
            }
        ],
    },
    {
        _id: 'username',
        type: 'text',
        displayName: 'Username',
        placeholder: 'username',
        required: true,
        minLength: 5,
    },
    {
        _id: 'password',
        type: 'password',
        displayName: {
            "default": "Password",
            changePwd: "Change Password",
            resetPwd: "Reset Password"
        },
        placeholder: {
            "default": "password",
            changePwd: "password",
            resetPwd: "password"
        },
        required: true
    },
    {
        _id: 'password_again',
        type: 'password',
        displayName: {
            "default": "Repeat Password",
            changePwd: "Repeat Password",
            resetPwd: "Repeat Password"
        },
        placeholder: {
            "default": "password",
            changePwd: "password",
            resetPwd: "password"
        },
        required: true
    }
]);

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    overrideLoginErrors: false,
    lowercaseUsername: true,
    focusFirstInput: true,

    // Appearance
    showLabels: true,
    showPlaceholders: true,

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
            signIn: "Log In",
            signUp: "Register Now!"
        },
        errors: {
            loginForbidden: "Login forbidden",
            mustBeLoggedIn: "Must be logged in",
            pwdMismatch: "Passwords don't match"
        },
        navSignIn: "Log In",
        navSignOut: "Log Out",
        resendVerificationEmailLink_pre: "",
        resendVerificationEmailLink_link: "",
        signInLink_pre: "Already have an account?",
        signInLink_link: "Sign In",
        signUpLink_pre: "Don't have an account?",
        signUpLink_link: "Register",
        title: {
            forgotPwd: "Recover Your Password",
            signIn: "Welcome!",
            signUp: "Create an Account"
        }
    },

    // Routing
    defaultLayout: 'frame',
    defaultLayoutRegions: {},
    defaultContentRegion: 'main'
});

Accounts.onLoginFailure((error) => {
    console.log(`\x1b[91m━━━━━ Failed login attempt at ${ error.connection.clientAddress }: ${ error.error.reason } ━━━━━\x1b[39m`);
});
