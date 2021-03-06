import './client.methods';

import _ from 'underscore';
import moment from 'moment/moment';

import {Experiments, Sessions, Subjects, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

// TODO: Use mqtt imports instead of require?
const bound = Meteor.bindEnvironment((callback) => callback()),
    clients = new Map(),
    mqtt = require('mqtt');

if (Meteor.isServer) Meteor.methods({
    'addExperiment': (fields) => {
        const template = Templates.findOne(fields.template);

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
        tags: fields.tags,
        users: [Meteor.userId()]
    }),
    'addTemplate': (template) => Templates.insert({
        author: Meteor.userId() || template.author,
        devices: 'any',
        icon: template.icon,
        inputs: template.inputs,
        name: template.name,
        number: template.number,
        session: template.session,
        stages: template.stages,
        users: (template.users) ? template.users : [Meteor.userId()]
    }),
    'addTrial': (id, index, number, origin) => {
        const session = Sessions.findOne(id),
            stages = session.settings.stages[index];

        if (stages) {
            const trial = Trials.insert({
                data: Array.from(stages, () => []),
                date: new Date(),
                experiment: session.experiment,
                index: index,
                number: number,
                session: id,
                stages: stages,
                subjects: session.subjects,
                timeOrigin: origin,
            });

            if (trial) Meteor.call('updateSession', id, 'trials', trial);
            return trial;
        }
    },
    'addUser': (username, id) => Meteor.users.update({'profile.username': username}, {
        $push: {'profile.experiments': id}
    }),
    'countCollection': (collection) => Sessions.find().count(),
    'mqttConnect': (id) => {
        /** If client already exists, reconnect: */
        if (clients.has(id)) {
            const client = clients.get(id);
            client.reconnect();
        } else {
            /** If client does not exist for device, create a new client with its IP address: */
            const device = Meteor.users.findOne(id),
                client = mqtt.connect('mqtt://' + device.profile.address);
            /** Configure client settings for this device: */
            client.on('connect', () => client.subscribe('response'));

            client.on('message', (topic, payload) => bound(() => {
                /** Instructs mqtt client on how to handle all incoming messages: */
                if (topic === 'response') {
                    /** Messages concerning device information & status: */
                    /** Buffer must be encoded as UTF-8 before JSON can parse: */
                        // const timeStamp = performance.now();
                    const message = JSON.parse(payload.toString('utf8'));

                    /** Sort message by the mqtt service/channel responding: */
                    if (message.sender) switch (message.sender) {
                        case 'board':
                            if (message.board) {
                                /** Information from Raspberry Pi command line output is extracted & stored in array: */
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

                                /** Device user's status updates to new pin readouts: */
                                Meteor.call('updateUser', id, 'status.board.pins', 'set', pins);
                            }
                            break;
                        case 'lights':
                        case 'reward':
                            if (message.context && message.context.trial) {
                                const session = Sessions.findOne(message.context.session);

                                if (session) {
                                    const stage = message.context.stage - 1,
                                        trial = session.trials[message.context.trial - 1];

                                    Meteor.call('updateTrial', trial, 'data.' + stage, 'push', {
                                        pins: message.pins,
                                        request: _.extend(message.request, {timeStamp: message.context.timeStamp}),
                                        /** Timestamps t0 & t1 are in seconds since the epoch, and
                                         *  message.context.timeStamp is in milliseconds since the
                                         *  browser loaded. The following converts the timestamps
                                         *  from the box to the box browser's frame of reference: */
                                        timeStamp: (message['t1'] - message['t0']) * 1000 + message.context.timeStamp,
                                        status: message.status,
                                        type: message.sender
                                    });
                                }
                            } else if (message.context && message.context.device) {
                                Meteor.call('updateUser', message.context.device, 'status.message', 'set', message);
                            }
                            break;
                    }
                } else if (topic === 'client') {
                    /** Messages for modifying this mqtt client: */
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

            /** Add client to directory Map: */
            clients.set(id, client);
        }
    },
    'mqttSend': (id, topic, message) => {
        if (clients.has(id)) {
            const client = clients.get(id);

            if (!client.connected) client.reconnect();
            client.publish(topic, JSON.stringify(message));
        } else {
            /** Call 'mqttConnect' method to create mqtt client instance: */
            Meteor.call('mqttConnect', id, (error) => {
                /** Now that a client exists for this device, publish message to its hosted mqtt server:  */
                const client = clients.get(id);
                if (!error) client.publish(topic, JSON.stringify(message));
            });
        }
    },
    'removeTemplate': (id) => Templates.remove({_id: id}, (error, result) => {
        if (!error) Experiments.update({}, {
            $pull: {templates: id}
        }, {multi: true});
    }),
    'removeUser': (username, id) => Meteor.users.update({'profile.username': username}, {
        $pull: {'profile.experiments': id}
    }),
    'setDefaultTemplate': (id, template) => {
        Experiments.update(id, {
            $pull: {
                templates: template
            }
        });
        Experiments.update(id, {
            $push: {
                templates: template
            }
        });
    },
    'updateExperiment': (experiment, values) => {
        const users = Meteor.users.find({'profile.username': {$in: values.users}}).fetch(),
            ids = _.pluck(users, '_id');

        _.difference(experiment.users, ids).forEach((id) => {
            Meteor.call('removeUser', id, experiment._id);
        });
        _.difference(ids, experiment.users).forEach((id) => {
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
