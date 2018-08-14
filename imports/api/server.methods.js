import './client.methods';

import {Experiments, Sessions, Trials} from './collections';
import {Meteor} from 'meteor/meteor';
// TODO: Use mqtt imports instead of require?
const mqtt = require('mqtt');

if (Meteor.isServer) Meteor.methods({
    'addExperiment': (experiment) => {
        return Experiments.insert({
            investigator: {
                id: Meteor.userId(),
                name: {first: experiment['investigator-first'], last: experiment['investigator-last']}
            },
            link: '/experiments/' + experiment.title.replace(/( )|(\W)/g, '-'),
            title: experiment.title,
            users: [Meteor.userId()]
        });
    },
    'addSession': (device, experiment, length, settings) => {
        // const device = devices[0];
        return Sessions.insert({
            date: new Date(),
            device: 'mqtt://' + device,
            experiment: experiment,
            settings: settings,
            subject: 'MouseID',
            trials: [],
            user: Meteor.userId(),
        });
    },
    'addTrial': (number, id) => {
        const session = Sessions.findOne(id),
            settings = session.settings[number - 1],
            stage = 1;

        /** Randomly generate stimuli within specified session parameters: */
        if (settings) Meteor.call('generateStimuli', settings[stage], (error, result) => {
            if (!error) {
                const trial = Trials.insert({
                    date: new Date(),
                    experiment: session.experiment,
                    number: number,
                    session: id,
                    stages: [{
                        data: [], visuals: [{
                            bars: {span: 300, weight: 10},
                            cross: {span: 75, weight: 5}
                        }]
                    }, {data: [], visuals: result}],
                    subject: 'MouseID'
                });
                if (trial) Meteor.call('updateSession', id, trial);
            }
        });
    },
    'mqttSend': (address, topic, message) => {
        const client = mqtt.connect(address);
        client.publish(topic, JSON.stringify(message));
    },
    'updateExperiment': (experiment, values) => {
        const users = Meteor.users.find({'profile.username': {$in: values.users}}).fetch(),
            ids = _.pluck(users, '_id');

        Experiments.update(experiment, {
            $set: {
                users: ids
            }
        });
    },
    'updateSession': (session, trial) => {
        Sessions.update(session, {
            $currentDate: {
                lastModified: true
            },
            $push: {
                trials: trial
            }
        });
    },
    'updateTrial': (number, response, session, stage) => {
        Trials.update({number: number, session: session, stages: {$elemMatch: {data: {$exists: true}}}},
            {
                $currentDate: {
                    lastModified: true
                },
                $push: {
                    ['stages.' + stage + '.data']: JSON.parse(response)
                }
            }, {multi: true});
    },
    'updateUser': (username, id) => {
        Meteor.users.update({'profile.username': username}, {
            $push: {'profile.experiments': id}
        });
    }
});
