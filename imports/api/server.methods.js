import './client.methods';

import _ from 'underscore';
import moment from 'moment/moment';

import {Experiments, Sessions, Subjects, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

import NanoTimer from 'NanoTimer';
// TODO: Use mqtt imports instead of require?
const bound = Meteor.bindEnvironment((callback) => callback()),
    clients = new Map(),
    mqtt = require('mqtt');

if (Meteor.isServer) Meteor.methods({
    'addExperiment': (fields) => {
        const template = Templates.findOne(fields.template);
        console.log(fields, template);

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
    'addSession': (device, experiment, inputs, session, subjects, trials) => {
        return Sessions.insert({
            date: new Date(),
            device: device,
            experiment: experiment,
            settings: {inputs: inputs, session: session, stages: trials},
            subjects: subjects,
            trials: [],
            user: Meteor.userId()
        });
    },
    'addSubject': (fields) => Subjects.insert({
        birthday: moment().subtract(fields.age, fields.unit).calendar(),
        description: fields.description,
        experiments: fields.experiments,
        identifier: fields.identifier,
        name: fields.name,
        protocol: fields.protocol,
        sex: fields.sex,
        strain: fields.strain,
        tags: fields.tags
    }),
    'addTemplate': (template) => Templates.insert({
        author: Meteor.userId() || template.author,
        devices: 'any',
        inputs: template.inputs,
        name: template.name,
        number: template.number,
        session: template.session,
        stages: template.stages,
        users: template.users
    }),
    'addTrial': (id, number) => {
        const session = Sessions.findOne(id),
            stages = session.settings.stages[number - 1];
        console.log('add trial:\n', id, session, stages);
        if (stages) {
            const trial = Trials.insert({
                data: Array.from(stages, () => []),
                date: new Date(),
                experiment: session.experiment,
                number: number,
                session: id,
                stages: stages,
                subject: 'MouseID'
            });
            console.log('insert trial:\t', trial);

            if (trial) Meteor.call('updateSession', id, 'trials', trial);
            return trial;
        }
    },
    'addUser': (username, id) => Meteor.users.update({'profile.username': username}, {
        $push: {'profile.experiments': id}
    }),
    'mqttConnect': (id) => {
        if (clients.has(id)) {
            const client = clients.get(id);
            client.reconnect();
        } else {
            const device = Meteor.users.findOne(id),
                client = mqtt.connect('mqtt://' + device.profile.address);

            client.on('connect', () => client.subscribe('response'));
            client.on('message', (topic, payload) => bound(() => {
                if (topic === 'response') {
                    const message = JSON.parse(payload.toString('utf8'));
                    console.log(message);
                    if (message.sender) switch (message.sender) {
                        case 'board':
                            const text = message['board']['pins'].split(/(?:[^.\\\s\w]+)(?:\+?\\n\s?\+?)?/igm),
                                cells = _.filter(text, (cell, i) =>
                                    i > 15 && i < (text.length - 16) && (i - 15) % 13),
                                groups = _.chunk(cells, 6),
                                pins = _.map(groups, (row, i) => {
                                    const pin = (i % 2) ? row.reverse() : row;

                                    return {
                                        bcm: pin[0].trim(),
                                        mode: pin[3].trim(),
                                        name: pin[2].trim(),
                                        physical: pin[5].trim(),
                                        voltage: pin[4].trim(),
                                        wpi: pin[1].trim()
                                    };
                                });

                            Meteor.call('updateUser', id, 'status.board.pins', 'set', pins);
                            break;
                        case 'lights':
                        case 'reward':
                            break;
                    }
                } else if (topic === 'client') {
                    const message = JSON.parse(payload.toString());

                    if (message.command) switch (message.command) {
                        case 'disconnect':
                            client.end();
                            break;
                        case 'reconnect':
                            client.reconnect();
                            break;
                        case 'subscribe':
                            client.subscribe(message.topic);
                            break;
                        case 'unsubscribe':
                            client.unsubscribe(message.topic);
                            break;
                    }
                }
            }));

            clients.set(id, client);
        }
    },
    'mqttSend': (id, topic, message) => {
        if (clients.has(id)) {
            const client = clients.get(id);

            if (!client.connected) client.reconnect();
            client.publish(topic, JSON.stringify(message));
        } else {
            Meteor.call('mqttConnect', id, (error) => {
                const client = clients.get(id);

                if (!error) client.publish(topic, JSON.stringify(message));
            });
        }
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
        console.log(session, key, value);
        if (key === 'trials') {
            Sessions.update(session, {
                $currentDate: {
                    lastModified: true
                },
                $push: {
                    trials: value
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
    'updateSubject': (id, fields) => Subjects.update({_id: id},
        {
            $currentDate: {
                lastModified: true
            },
            $set: {
                birthday: moment().subtract(fields.age, fields.unit).toDate(),
                description: fields.description,
                experiments: fields.experiments,
                identifier: fields.identifier,
                name: fields.name,
                protocol: fields.protocol,
                sex: fields.sex,
                strain: fields.strain,
                tags: fields.tags
            }
        }, {multi: true}),
    'updateTrial': (id, key, operation, value) => Trials.update({_id: id}, {
        $currentDate: {
            lastModified: true
        },
        ['$' + operation]: {
            [key]: value
        }
    }, {multi: true}),
    'updateUser': (id, key, operation, value) => Meteor.users.update({_id: id}, {
        $currentDate: {
            lastModified: true
        },
        ['$' + operation]: {
            [key]: value
        }
    })
});
