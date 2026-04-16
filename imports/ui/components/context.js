import '/imports/ui/components/context.html';

import Tone from 'tone';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Template.audioContext.onCreated(function () {
    this.suspended = new ReactiveVar(Tone.context.state === 'suspended');
    Tone.context.on('statechange', () => this.suspended.set(Tone.context.state === 'suspended'));
});

Template.audioContext.events({
    'click' () {
        if (Tone.context.state !== 'running') Tone.context.resume();
    }
});

Template.audioContext.helpers({
    'suspended' () {
        return Template.instance().suspended.get();
    }
});
