import './client.methods';

import _ from 'underscore';
import moment from 'moment/moment';
import * as mqtt from 'mqtt';

import {Experiments, Sessions, Subjects, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

export const clients = new Map();
const clientClosed = (n) => ('\v\x1b[45;97m Connection Closed, reasonCode: ' + n + ' \x1b[39;49m\v\r'),
status = (client, id, title) => {
    const statuses = ['connected', 'disconnecting', 'reconnecting'];
    let status = '\n\x1b[43;30m ' + id + ' \x1b[0m  \x1b[33m' + title + '\n\x1b[33m━━━━━';
    
    _.each(statuses, (s) => {
        const color = (client[s]) ? ';32' : ';37',
        tabs = (s !== 'disconnecting') ? '\t\t' : '\t';

        status +='\n⦿ ' + s + ':' + tabs + '\x1b[1' + color + 'm' + client[s] + '\x1b[22;39m';
    });

    return status + '\x1b[22m\n\x1b[33m━━━━━\n';
};

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
    'updateClient': (id, command) => {
		if (clients.has(id)) {
            const client = clients.get(id);

            if (command === 'end') {
				client.end(false, {reasonCode: 4}, () => console.log(clientClosed(4)));
			} else if (command === 'connect') {
				client.reconnect();
			}
        }
    },
    'getClients': () => {
		const ids = clients.keys();

		clients.forEach((value, key) => {
			const id = key.replace('test_', ''),
			client = _.pick(value, 'options', 'connected', 'disconnecting', 'nextId', 'reconnecting', 'disconnected', '_deferredReconnect');
			console.log(key, id, client);
			Meteor.users.update({_id: id}, {
				$set: {'status.client': client}
			});//TODO: multiple clients per box
		});
    },
    'mqttConnect': (id, options) => {
        /** If client already exists, reconnect: */
        if (clients.has(id)) {
            const client = clients.get(id);

            if (client.reconnecting !== true && !client.connected) {
				client.end(false, {reasonCode: 5}, () => {
                    console.log(clientClosed(5));
                    client.reconnect();
				});
			}
        } else {
            /** If client does not exist for device, create a new client with its IP address: */
            const device = Meteor.users.findOne(id.replace('test_', '')),
                // client = mqtt.connect('mqtt://' + device.profile.address, options),
                client = mqtt.connect( _.extend(options, {host: 'ws://' + device.profile.address + ':8080/mqtt', hostname: device.profile.address})),
				syncMessage = Meteor.bindEnvironment((topic, payload) => {
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
                                /* const text = message['board']['pins'].split(/(?:[^.\\\s\w]+)(?:\+?\\n\s?\+?)?/igm),
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
                                    }); */

                                /** Device user's status updates to new pin readouts: */
                                Meteor.call('updateUser', id.replace('test_', ''), 'status.board.pins', 'set', message['board']);
                            }
                            break;
                        case 'lights':
                        case 'reward':
						case 'sensor':
                            if (message.context) {//TODO: Check Box 4 & 5 for difference from Box 3
								if (message.context.device) {console.log('\n\t\t- TESTING -\n\t\t', message, '\n');
									Meteor.call('updateUser', message.context.device, 'status.message', 'set', message);
								} else {
									const context = (message.context.topic) ? message.context.topic.split('/') : '',
									session = Sessions.findOne(context[1] || message.context.session);

									if (session) {
										const stage = (context[3] || message.context.stage) - 1,
											trial = session.trials[(context[2] || message.context.trial) - 1],
											timeStamp = (message['t1'] - message['t0']) * 1000 + message.context.timeStamp;

										Meteor.call('updateTrial', trial, 'data.' + stage, 'push', {
											pins: message.pins,
											request: _.extend(message.request, {timeStamp: message.context.timeStamp}),
											/** Timestamps t0 & t1 are in seconds since the epoch, and
											 *  message.context.timeStamp is in milliseconds since the
											 *  browser loaded. The following converts the timestamps
											 *  from the box to the box browser's frame of reference: */
											t0: message['t0'],
											t1: message['t1'],
											timeStamp: timeStamp,
											status: message.status,
											type: message.sender
										});
									}
								}
							}
                            break;
                    }
                } else if (topic === 'client') {
                    /** Messages for modifying this mqtt client: */
                    const message = JSON.parse(payload.toString());

                    if (message.command) switch (message.command) {
                        case 'disconnect':
                            client.end(false, {reasonCode: 6}, () => console.log(clientClosed(6)));
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
            });
			
            /** Configure client settings for this device: */
            client.on('connect', () => client.subscribe(['client', 'response'], {qos: 0}));
            client.on('reconnect', () => console.log(status(client, id, 'RECONNECT')));
//            client.on('packetsend', (packet) => console.log(status(client, id, 'SENT'), packet));
//            client.on('packetreceive', (packet) => console.log(status(client, id, 'RECEIVED'), packet));
            client.on('end', () => console.log(status(client, id, 'END')));
//            client.on('close', () => console.log(status(client, id, 'CLOSE')));
//            client.on('offline', () => console.log(status(client, id, 'OFFLINE')));
            client.on('error', (e) => console.log('\n\n\x1b[91m━━━━━', e, '━━━━━\x1b[39m\n'));
            client.on('message', syncMessage);

            /** Add client to directory Map: */
            clients.set(id, client);
        }
    },
    'mqttSend': (id, topic, message) => {
        if (clients.has(id)) {
            const client = clients.get(id);

			if (client.reconnecting !== true && !client.connected) {
                client.end(false, {reasonCode: 1}, ()=> {
                    console.log(clientClosed(1));
                    client.reconnect();
                });
			}

			client.publish(topic, JSON.stringify(message), {qos: 0}, (e) => {
                if (!e) {
                    console.log('\n⦿ \x1b[33mEstablished\x1b[0;39;49m client \x1b[43;30m ' + id + ' \x1b[39;49m publishes: \x1b[7;33m', message.command, '\x1b[27;39;49m');
					if (id.startsWith('test_') && message.detect && message.detect !== 'on') client.end(false, {reasonCode: 2}, () => console.log(clientClosed(2)));
				}
			});
        } else if (message.command !== 'disconnect') {
            /** Call 'mqttConnect' method to create mqtt client instance: */
			const options = {
                clientId: id,
                clean: false,
                connectTimeout: 10 * 1000,
                keepalive: 60,
                protocolId: 'MQTT',
                protocolVersion: 4,
                reconnectPeriod: 1000,
                rejectUnauthorized: false
            };

            Meteor.call('mqttConnect', id, options, (error) => {
                /** Now that a client exists for this device, publish message to its hosted mqtt server:  */
                const client = clients.get(id);
				console.log('\x1b[93m━━━━━\n\x1b[93mCreated client \x1b[103;30m ' + id, '\x1b[39;49m\n\x1b[33mUpdated clients list: ', clients.keys(), '\x1b[39;49m\n\x1b[93m━━━━━');
                if (!error) client.publish(topic, JSON.stringify(message), {qos: 0}, (e) => {
					if (!e) {
						console.log('\n⦿ \x1b[93mNew\x1b[39;49m client \x1b[103;30m ' + id + ' \x1b[39;49m publishes: \x1b[103;30m', message.command, '\x1b[39;49m');
						if (id.startsWith('test_') && message.detect && message.detect !== 'on') client.end(false, {reasonCode: 3}, () => console.log(clientClosed(3)));
					}
				});
            });
        }
    },
    'removeTemplate': (id) => Templates.remove({_id: id}, (error, result) => {
        if (!error) Experiments.update({}, {
            $pull: {templates: id}
        }, {multi: true});
    }),
    'removeSession': (id) => Sessions.remove({_id: id}),
    'removeTrials': (ids) => Trials.remove({_id: {$in: ids}}),
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
