import './client.methods';

import _ from 'underscore';
import moment from 'moment/moment';
import * as mqtt from 'mqtt';

import {Experiments, Sessions, Subjects, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

const clients = new Map();

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
    'mqttConnect': (id, options) => {
        /** If client already exists, reconnect: */
        if (clients.has(id)) {
            const client = clients.get(id);

            if (client.reconnecting !== true && !client.connected) {
//				console.log('\n\n\t - 2) END & RECONNECT -\n\n');
//				console.log('\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting);
				client.end();
				client.reconnect();
			}
        } else {
            /** If client does not exist for device, create a new client with its IP address: */
            const device = Meteor.users.findOne(id.replace('test_', '')),
                client = mqtt.connect('mqtt://' + device.profile.address, options),
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
                            if (message.context) {
								if (message.context.device) {
									Meteor.call('updateUser', message.context.device, 'status.message', 'set', message);
								} else {
									const context = (message.context.topic) ? message.context.topic.split('/') : '',
									session = Sessions.findOne(context[1] || message.context.session);

									if (session) {
										const stage = (context[3] || message.context.stage) - 1,
											trial = session.trials[(context[2] || message.context.trial) - 1],
											timeStamp = (message['t1'] - message['t0']) * 1000 + message.context.timeStamp;
console.log('\n', message, '\n', timeStamp);
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
                            client.end(true);
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
//            client.on('reconnect', () => console.log('\n\n\t - ' + id + ' RECONNECT -\n\n', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n'));
//            client.on('packetsend', (packet) => console.log(id + ' packet SENT', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n', packet, '\n'));
 //           client.on('packetreceive', (packet) => console.log(id + ' packet RECEIVED', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n', packet, '\n'));
//            client.on('end', () => console.log('\n\n\t - ' + id + ' END -\n\n', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n'));
//            client.on('close', () => console.log('\n\n\t - ' + id + ' CLOSE -\n\n', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n'));
//            client.on('offline', () => console.log('\n\n\t - ' + id + ' OFFLINE -\n\n', '\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting + '\n'));
            client.on('error', (e) => console.log(e));
            client.on('message', syncMessage);

            /** Add client to directory Map: */
            clients.set(id, client);
        }
    },
    'mqttSend': (id, topic, message) => {
        if (clients.has(id)) {
            const client = clients.get(id);

			if (client.reconnecting !== true && !client.connected) {
//				console.log('\n\n\t - 1) END & RECONNECT -\n\n');console.log(message);
//				console.log('\nconnected:\t\t', client.connected, '\ndisconnecting:\t', client.disconnecting, '\nreconnecting:\t', client.reconnecting);
				client.end();
				client.reconnect();
			}
			
			client.publish(topic, JSON.stringify(message), {qos: 0}, (e) => {
					if (!e) {
						//console.log('\n1) SUCCESSFULLY PUBLISHED COMMAND:', message.command, '\n');
						if (id.startsWith('test_')) client.end();
					}
				});
        } else if (message.command !== 'disconnect') {
            /** Call 'mqttConnect' method to create mqtt client instance: */
			const options = (!id.startsWith('test_')) ? {clientId: id} : {clientId: id, clean: false, keepalive: 0, reconnectPeriod: 0};

            Meteor.call('mqttConnect', id, options, (error) => {
                /** Now that a client exists for this device, publish message to its hosted mqtt server:  */
                const client = clients.get(id);
//				console.log('Created ' + id, clients.keys());
                if (!error) client.publish(topic, JSON.stringify(message), {qos: 0}, (e) => {
					if (!e) {
						//console.log('\n2) SUCCESSFULLY PUBLISHED COMMAND:', message.command, '\n');
						if (id.startsWith('test_') && message.detect !== 'on') client.end();
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
