import '/imports/ui/layouts/bare';
import '/imports/ui/layouts/frame';
import '/imports/ui/pages/calibrate';
import '/imports/ui/pages/create';
import '/imports/ui/pages/data';
import '/imports/ui/pages/devices';
import '/imports/ui/pages/experiment';
import '/imports/ui/pages/home';
import '/imports/ui/pages/log';
import '/imports/ui/pages/notFound';
import '/imports/ui/pages/subjects';
import '/imports/ui/pages/trial';

import {BlazeLayout} from 'meteor/kadira:blaze-layout';
import {FlowRouter} from 'meteor/kadira:flow-router';

BlazeLayout.setRoot('body');

FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('frame', {main: 'home'});
    },
});

FlowRouter.route('/calibrate', {
    name: 'calibrate',
    action() {
        BlazeLayout.render('bare', {main: 'calibrate'});
    },
});

FlowRouter.route('/create', {
    name: 'create',
    action() {
        BlazeLayout.render('frame', {main: 'createExperiment'});
    },
});

FlowRouter.route('/devices', {
    name: 'devices',
    action() {
        BlazeLayout.render('frame', {main: 'devicePanel'});
    },
});

FlowRouter.route('/experiments/:link/', {
    triggersEnter: [function (context, redirect) {
        redirect(context.path + '/run');
    }],
    action: function (params) {
        throw new Error("Oops!");
    }
});

FlowRouter.route('/experiments/:link/:action', {
    action() {
        BlazeLayout.render('frame', {main: 'experiment'});
    }
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('frame', {main: 'notFound'});
    },
};

FlowRouter.route('/session/:session', {
    action() {
        BlazeLayout.render('bare', {main: 'trial'});
    }
});

FlowRouter.route('/subjects', {
    name: 'subjects',
    action() {
        BlazeLayout.render('frame', {main: 'subjectPanel'});
    },
});
