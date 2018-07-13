import './client.methods';

import {Experiments, Sessions, Trials} from './collections';
import {Meteor} from 'meteor/meteor';
//TODO: Use mqtt imports instead of require?
const mqtt = require('mqtt');

if (Meteor.isServer) {
    Meteor.methods({
        'addExperiment': function (experiment) {
            return Experiments.insert({
                investigator: {
                    id: this.userId,
                    name: {first: experiment['investigator-first'], last: experiment['investigator-last']}
                },
                link: '/experiments/' + experiment.title.replace(/( )|(\W)/g, '-'),
                title: experiment.title,
                users: [this.userId]
            });
        },
        'addSession': function (devices, experiment) {
            const device = devices[0];
            return Sessions.insert({
                date: new Date(),
                device: 'mqtt://' + device,
                experiment: experiment,
                stimuli: 2,
                subject: 'MouseID',
                trials: [],
                user: Meteor.userId(),
            });
        },
        'addTrial': function (experiment, number, session, stage) {
            /** Randomly generate stimuli within specified experiment parameters: */
            Meteor.call('generateStimuli', stage.visuals, function (error, result) {
                if (!error) {
                    const trial = Trials.insert({
                        date: new Date(),
                        experiment: experiment,
                        number: number,
                        session: session,
                        stages: [{
                            data: [], visuals: [{
                                bars: {span: 300, weight: 10},
                                cross: {span: 75, weight: 5}
                            }]
                        }, {data: [], visuals: result}],
                        subject: 'MouseID'
                    });
                    if (trial) Meteor.call('updateSession', session, trial);
                }
            });
        },
        'mqttSend': function (address, topic, message) {
            const client = mqtt.connect(address);
            client.publish(topic, JSON.stringify(message));
        },
        'updateSession': function (session, trial) {
            Sessions.update(session, {
                $currentDate: {
                    lastModified: true
                },
                $push: {
                    trials: trial
                }
            });
        },
        'updateTrial': function (number, response, session, stage) {
            Trials.update({number: number, session: session, stages: {$elemMatch: {data: {$exists: true}}}},
                {
                    $currentDate: {
                        lastModified: true
                    },
                    $push: {
                        ['stages.' + stage + '.data']: JSON.parse(response)
                    }
                }, {multi: true});
        }
    });
}
