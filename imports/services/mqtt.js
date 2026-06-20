/**
 * imports/services/mqtt.js
 *
 * Purpose:
 *  - MQTT client lifecycle management
 *  - Event routing (MQTT → internal event bus → persistence)
 *  - Centralized side-effect handling (notifications, trials, user state)
 *
 * Notes:
 *  - Bridges MQTT messages, Meteor methods, & internal event bus
 *  - Persistence layer is event-driven via `eventBus`
 * */

import EventEmitter from 'eventemitter3';
import { Meteor } from 'meteor/meteor';
import * as mqtt from 'mqtt';
import { hub } from '/imports/startup/client/mqtt';

export const clients = new Map(),
    eventBus = new EventEmitter(),
    notificationsEnabled = true,
    persistenceEnabled = true,
    persistence = {
        'client:state': (d) => {
            mqttSend(`clients/${ d.user }/status`, { state: d.state, updatedAt: Date.now(), ...d.params });
            return Promise.resolve();
        },
        'client:update': (d) => Meteor.callAsync('updateClient', d.device, d.msg, d.retained),
        'trial:add': (d) => Meteor.callAsync('addTrial', d.session, d.index, d.number, d.timeOrigin, d.bias),
        'trial:update': (d) => Meteor.callAsync('getTrial', d.dest, d.session, d.trial, d.stage, d.payload),
        'user:notify': (d) => Meteor.callAsync('updateUserByUsername', d.device, 'status.message', 'set', d.notification),
        'queue:advance': (d) => Meteor.callAsync('advanceQueuePointer', d.user)
    },
    routes = {
        'clients.*.status': (d) => {
            const { device, msg, packet, type } = d;

            if (persistenceEnabled) eventBus.emit('client:update', { device, msg, retained: packet.retain });
            logStatus(device, msg, packet.retain, type);
        },
        'hub.*.command': (d) => hubCmd(d.client, d.msg),
        'hub.*.response': (d) => onResponse(d.device, d.msg)
    },
    store = {
        flushing: false,
        sessions: new Map(),
        users: new Map(),
        queue: [],

        async flushQueue() {
            if (this.flushing) return;

            this.flushing = true;

            try {
                while (this.queue.length) {
                    const { data, type } = this.queue.shift(),
                        handler = persistence[ type ];

                    if (!handler) {
                        console.warn('Unhandled event:', type);
                        continue;
                    }

                    try {
                        const result = handler(data);
                        Promise.resolve(result).catch(err => console.error('Error in queue:', type, err));
                    } catch (err) {
                        console.error('Sync error in queue:', type, err);
                    }
                }
            } finally {
                this.flushing = false;
            }
        },
        getSession(id) { return this.sessions.get(id); },
        setSession(id, value) { this.sessions.set(id, value); },
        updateSession(id, fn) {
            const current = this.sessions.get(id);
            this.sessions.set(id, fn(current));
        }
    },

    /** TRANSPORT: */
    connectClient = (clientId, host = 'localhost', options = {}, will) => {
        const { protocol, port, path } = Meteor.settings.public.mqtt,
            url = `${ protocol }://${ host }:${ port }${ path }`,
            config = { clientId, ...options };

        if (will) config.will = will;

        return mqtt.connect(url, config);
    },
    createClient = (clientId) => {
        if (clients.has(clientId)) return;

        const client = connectClient(clientId, 'localhost', {}, {
                topic: `clients/${ clientId }/status`,
                payload: JSON.stringify({ online: false, state: 'offline', updatedAt: Date.now() }),
                qos: 1,
                retain: true
            }),
            hubCmd = (client, msg) => {
                const actions = {
                        disconnect: () => {
                            const status = JSON.stringify({
                                    online: false,
                                    state: 'offline',
                                    lastSeen: Date.now(),
                                    updatedAt: Date.now()
                                });

                            if (!client.disconnecting && !client.disconnected) {
                                client.publish(`clients/${ clientId }/status`, status, { qos: 1, retain: true },
                                    () => client.end());
                            }
                        }
                    };

                actions[ msg.command ]?.();
            };

        client.on('close', () => clients.delete(clientId));
        client.on('connect', () => {
            client.publish(`clients/${ clientId }/status`, JSON.stringify({
                online: true,
                state: 'idle',
                lastSeen: Date.now(),
                updatedAt: Date.now()
            }), { qos: 1, retain: true });

            client.subscribe(`hub/${ clientId }/command`);
            logConnect(clientId);
        });
        client.on('error', (e) => {
            console.error(clientId, performance.now(), 'ERROR:', e);
            eventBus.emit('client:state', { user: clientId, state: 'error', params: { error: e.message } });
        });
        client.on('message', (topic, payload, packet) => {
            const msg = JSON.parse(payload.toString());

            if (topic === `hub/${ clientId }/command`) return hubCmd(client, msg);
            dispatch(topic, msg, packet);
        });

        clients.set(clientId, client);

        return client;
    },
    dispatch = (topic, msg, packet) => {
        const [ domain, device, type ] = topic.split('/'),
            keys = [
                `${ domain }.${ device }.${ type }`,
                `${ domain }.*.${ type }`,
                `${ domain }.${ device }`,
                domain
            ];

        for (const k of keys) if (routes[ k ]) return routes[ k ]({ device, msg, packet, type });
        console.warn('Unhandled route:', topic);
    },
    getClient = () => {
        const [ client ] = clients.values();
        return client || hub;
    },
    mqttSend = (topic, message, cb = () => {}) => {
        const client = getClient();

        if (!client?.connected) return console.warn('MQTT client unavailable'); // TODO: Queue messages or ensure connect at start of session

        client.publish(topic, JSON.stringify(message), (err) => {
            if (err) return console.error('MQTT publish failed:', topic, err);
            cb();
        });
    },

    /** DIAGNOSTICS: */
    logConnect = (clientId, host = 'localhost') => {
        const { protocol, port, path } = Meteor.settings.public.mqtt;

        console.group(
          `%c ✔ ${ clientId.toUpperCase() } CONNECTED `,
          "background: limegreen; color: #222; font-weight: bold; padding: 2px 6px; border-radius: 3px;");
        console.log(
          `%c broker: %c${ protocol }://${ host }:${ port }${ path }`,
          "color: limegreen;",
          "color: inherit;");
        console.groupEnd();
    },
    logStatus = (device, msg, retain, type) => {
        const color = msg.online ? 'limegreen' : 'tomato',
            retained = retain ? '📤' : '',
            updatedAt = new Date().toLocaleTimeString();

        console.groupCollapsed(
            `%c ${ updatedAt.padEnd(15) } 📟 ${ device.padEnd(15) } %c  ${ type } ${ retained }`,
            `background: ${ color }; border-radius: 2px; color: #222; padding: 1px; font-weight: bold`, 'color: inherit');
        _.each(msg, (v, k) => console.log(`\t%c${ k.padEnd(12) }`, `color: ${ color };`, v));
        console.groupEnd();
    },

    /** RUNTIME ROUTING: */
    onMessage = (topic, payload, packet) => {
        // TODO: Turn into schema enforcement somehow?
        let msg;

        try {
            /** Buffer must be encoded as UTF-8 before JSON can parse: */
            msg = JSON.parse(payload.toString('utf8'));
        } catch {
            msg = payload.toString();
        }

        dispatch(topic, msg, packet);
    },
    onResponse = async (device, msg) => {
        const senders = ['board', 'lights', 'reward', 'sensor'];

        if (!senders.includes(msg.sender) || !msg.context) return; // TODO: Fix for new schema, 'meta'

        if (notificationsEnabled) {
            const notification = _.pick(msg, [ 'pin', 'pins', 'request', 'sender', 'status' ]);
            eventBus.emit('user:notify', { device, notification });
        }
        if (persistenceEnabled) updateTrialData(msg);
    },

    /** SESSION PROCESSING: */
    updateTrialData = async ({ context, pins, request, sender, status, t0, t1, ts }) => {
        const { session, stage, timeStamp, trial } = context;

        if (!session || !Number.isFinite(trial)  || !Number.isFinite(stage)) return;

        const payload = {
                pins,
                request: { ...request, timeStamp },
                /** Timestamps t0 & t1 are in seconds since the epoch, and
                 *  context.timeStamp is in milliseconds since the browser
                 *  loaded. The following converts the timestamps from the
                 *  box to the box browser's frame of reference: */
                t0,
                t1,
                timeStamp: (ts || t1 - t0) * 1000 + timeStamp,
                status,
                type: sender
            };

        eventBus.emit('trial:update', { session, trial, stage, payload });
    };


Object.keys(persistence).forEach(type => { eventBus.on(type, data => {
    store.queue.push({ type, data });
    // TODO: Check if session is active before flush?
    store.flushQueue();
} ); });
