import '../../ui/layouts/bare';
import '../../ui/layouts/frame';
import '../../ui/pages/create';
import '../../ui/pages/home';
import '../../ui/pages/notFound';
import '../../ui/pages/data';
import '../../ui/pages/trial';

import {FlowRouter} from 'meteor/kadira:flow-router';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';

BlazeLayout.setRoot('body');

FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('frame', {main: 'home'});
    },
});

FlowRouter.route('/create', {
    name: 'create',
    action() {
        BlazeLayout.render('frame', {main: 'createExperiment'});
    },
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('frame', {main: 'notFound'});
    },
};

FlowRouter.route('/experiments/:link/', {
    triggersEnter: [function (context, redirect) {
        redirect(context.path + '/run');
    }],
    action: function (params) {
        throw new Error("Oops!");
    }
});

FlowRouter.route('/experiments/:link/:action', {
    action(params) {
        BlazeLayout.render('frame', {main: 'experiment'});
    }
});

FlowRouter.route('/:session/trial/:trial/stage/:stage', {
    action(params) {
        BlazeLayout.render('bare', {main: 'trial'});
    }
});
