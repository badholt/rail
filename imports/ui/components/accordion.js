import './accordion.html';

import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

Template.accordion.events({
    'input #stimuli-form input'(event) {
        // const target = event.target || event.srcElement,
        //     value = parseInt($('#stimuli-form').form('get value', target.name));
        //
        // switch (target.name) {
        //     case 'number':
        //         let stages = [{data: [], visuals: []}, {data: [], visuals: []}];
        //
        //         for (let i = 0; i < value; i++) {
        //             stages[1].visuals.push({
        //                 grid: {
        //                     blacklist: [
        //                         [JSON.stringify({x: 1, y: 1}), true],
        //                         [JSON.stringify({x: 1, y: 2}), true],
        //                         [JSON.stringify({x: 1, y: 3}), true],
        //                         [JSON.stringify({x: 2, y: 3}), true],
        //                         [JSON.stringify({x: 3, y: 1}), true],
        //                         [JSON.stringify({x: 3, y: 2}), true],
        //                         [JSON.stringify({x: 3, y: 3}), true],
        //                     ],
        //                     x: 3, y: 3
        //                 }, opacity: 1, spacing: 3, span: 300, weight: 10
        //             });
        //         }
        //
        //         Session.set('stages', stages);
        //         Session.set('stimuli', value);
        //         break;
        // }
    },
    'input #trials-form input'(event) {
        // const target = event.target || event.srcElement,
        //     value = $('#trials-form').form('get value', target.name);
        //
        // switch (target.name) {
        //     case 'number':
        //         Session.set('total', parseInt(value));
        //         break;
        // }
    }
});

Template.accordion.onRendered(function () {
    $('.ui.accordion').accordion({
        exclusive: false
    });
});

Template.deviceForm.helpers({
    device() {
        return Meteor.users.find({'profile.device': true});
    }
});

Template.deviceForm.onRendered(function () {
    $('select.dropdown').dropdown();
});
