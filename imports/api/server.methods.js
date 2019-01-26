import './client.methods';

import {Experiments, Sessions, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

import NanoTimer from 'NanoTimer';
// TODO: Use mqtt imports instead of require?
const mqtt = require('mqtt'),
    timers = new Map();

if (Meteor.isServer) Meteor.methods({
    'addExperiment': (fields) => {
        const template = Templates.findOne({
            $and: [{name: fields.template},
                {$or: [{users: 'any'}, {users: {$elemMatch: {$eq: Meteor.userId()}}}]}]
        });

        return Experiments.insert({
            investigator: {
                id: Meteor.userId(),
                name: {first: fields['investigator-first'], last: fields['investigator-last']}
            },
            link: '/experiments/' + fields.title.replace(/( )|(\W)/g, '-'),
            templates: [template._id],
            title: fields.title,
            users: [Meteor.userId()]
        });
    },
    'addSession': (device, experiment, form) => {
        console.log(device, experiment, form);

        return Sessions.insert({
            date: new Date(),
            device: device,
            experiment: experiment,
            settings: form,
            subject: 'MouseID',
            trials: [],
            user: Meteor.userId()
        });
    },
    'addTemplate': (template) => Templates.insert({
        creator: template.creator,
        devices: template.devices,
        name: template.name,
        number: template.number,
        session: template.session,
        stages: template.stages,
        users: template.users
    }),
    'addTrial': (id, number) => {
        const session = Sessions.findOne(id),
            trial = Trials.insert({
                date: new Date(),
                experiment: session.experiment,
                number: number,
                session: id,
                stages: session.settings.stages[number - 1],
                subject: 'MouseID'
            });

        if (trial) Meteor.call('updateSession', id, 'trials', trial);
        return trial;
    },
    'addUser': (username, id) => Meteor.users.update({'profile.username': username}, {
        $push: {'profile.experiments': id}
    }),
    'mqttSend': (id, topic, message) => {
        const device = Meteor.users.findOne(id),
            address = 'mqtt://' + device.profile.address,
            client = mqtt.connect(address);
        console.log(id, device, topic, message);

        client.publish(topic, JSON.stringify(message));
    },
    'removeUser': (username, id) => Meteor.users.update({'profile.username': username}, {
        $pull: {'profile.experiments': id}
    }),
    'updateExperiment': (experiment, values) => {
        const users = Meteor.users.find({'profile.username': {$in: values.users}}).fetch(),
            ids = _.pluck(users, '_id');

        _.difference(experiment.users, ids).forEach((id) => {
            console.log('rem: ', id);
            Meteor.call('removeUser', id, experiment._id);
        });
        _.difference(ids, experiment.users).forEach((id) => {
            console.log('add: ', id);
            Meteor.call('addUser', id, experiment._id);
        });

        Experiments.update(experiment._id, {
            $set: {
                users: ids
            }
        });
    },
    'updateSession': (session, key, value) => {
        if (key === 'trials') {
            Sessions.update(session, {
                $currentDate: {
                    lastModified: true
                },
                $push: {
                    [key]: value
                }
            });
        } else {
            Sessions.update(session, {
                $currentDate: {
                    lastModified: true
                },
                $set: {
                    [key]: value
                }
            });
        }
    },
    'updateTimer': (session, key, args, interval) => {
        let timer = (timers.has(key)) ? timers.get(key) : new NanoTimer();
        const active = timer.hasTimeout();

        if (!active) {
            console.log('Started timer for ' + key + " at " + Date.now());
            Meteor.call('updateSession', session._id, 'timers.' + key, true);

            return timer.setTimeout(Meteor.bindEnvironment((err, res) => {
                console.log('Completed timer for ' + key + " at " + Date.now());
                return Meteor.call('updateSession', session._id, 'timers.' + key, false);
            }), args, interval);
        } else {
            console.log('Stopped timer for ' + key + " at " + Date.now());
            timer.clearTimeout();
        }

        timers.set(key, timer);
    },
    'updateTrial': (number, response, session, stage) => Trials.update({
            number: number,
            session: session,
            stages: {$elemMatch: {data: {$exists: true}}}
        },
        {
            $currentDate: {
                lastModified: true
            },
            $push: {
                ['stages.' + stage + '.data']: response
            }
        }, {multi: true})
});
