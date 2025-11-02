import '/imports/ui/layouts/bare';
import '/imports/ui/layouts/frame';
import '/imports/ui/pages/calibrate';
import '/imports/ui/pages/create';
import '/imports/ui/pages/data';
import '/imports/ui/pages/devices';
import '/imports/ui/pages/experiment';
import '/imports/ui/pages/home';
import '/imports/ui/pages/notFound';
import '/imports/ui/pages/subjects';
import '/imports/ui/pages/trial';

import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { FlowRouter } from 'meteor/kadira:flow-router';

BlazeLayout.setRoot('body');

/** Group routes: */
const isAdmin = (context, redirect) => {
        if (!Meteor.user() || Meteor.user().profile.device) redirect('/');
    },
    isNotLoggedIn = (context, redirect) => {
        if (!Meteor.loggingIn() && !Meteor.user()) redirect('/');
    },
    loggedIn = FlowRouter.group({
        name: 'loggedIn',
        triggersEnter: [ isNotLoggedIn ]
    }),
    adminRoutes = loggedIn.group({
        name: 'admin',
        triggersEnter: [ isAdmin ]
    });


/** PUBLIC: */
FlowRouter.route('/', {
    name: 'home',
    action() { BlazeLayout.render('frame', { main: 'home' }); },
});

FlowRouter.notFound = {
    name: 'notFound',
    action() { BlazeLayout.render('frame', { main: 'notFound' }); },
};


/** EXPERIMENTER ONLY: */
adminRoutes.route('/devices', {
    name: 'devices',
    action() { BlazeLayout.render('frame', { main: 'devicePanel' }); },
});

adminRoutes.route('/experiments/:link/', {
    triggersEnter: [ (context, redirect) => {
        redirect(`${ context.path }/run`);
    } ]
});

adminRoutes.route('/experiments/:link/:action', {
    action() { BlazeLayout.render('frame', { main: 'experiment' }); }
});

adminRoutes.route('/subjects', {
    name: 'subjects',
    action() { BlazeLayout.render('frame', { main: 'subjectPanel' }); }
});


/** ALL USERS: */
loggedIn.route('/session/:session', {
    action() { BlazeLayout.render('bare', { main: 'trial' }); }
});

loggedIn.route('/calibrate', {
    name: 'calibrate',
    action() { BlazeLayout.render('bare', { main: 'calibrate' }); }
});

loggedIn.route('/create', {
    name: 'create',
    action() { BlazeLayout.render('frame', { main: 'createExperiment' }); }
});
