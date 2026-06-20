/**
 * imports/ui/components/trial/io.js
 *
 * Purpose:
 *  - Interfaces between runtime engine & persistence layer
 * */

import update from 'immutability-helper';
import _ from 'underscore';
import { eventBus, mqttSend } from '/imports/services/mqtt';

export function createIO(instance) {
    const mqtt = {
            command: (msg, timer, topic) => mqtt.send(topic, msg,
                () => instance.log.recordTimer(timer, 'fired', '🎯 Fired', false, 'mqtt')),
            context: (context, topic) => mqtt.send(topic, { command: 'set', context },
                () => instance.io.trial.record({ timeStamp: context.timeStamp, topic, type: 'set.context' })),
            send: (topic, msg, cb = () => {}) => mqttSend(topic, msg, cb),
            sensorOff: () => mqtt.send('sensor', { command: 'detect', detect: 'off' }),
            sensorOn: () => mqtt.send('sensor', {
                    command: 'detect',
                    detect: 'on',
                    context: { timeStamp: performance.now() }
                })
        },
        storage = {
            update: (key, value) => {
                if (!key) return;

                /** In case of multiple variable changes, update storage reactively: */
                instance.storage.set(update(instance.storage.get(), { [ key ]: { $set: value } }));

                /** Update persistence: */
                const trial = instance.n.get() + 1,
                    session = instance.session.get()._id;

                eventBus.emit('trial:update', { dest: 'storage', session, trial, payload: { key, value } });
            }
        },
        trial = {
            add: (index, number, timeOrigin, bias) => {
                const session = instance.session.get(),
                    stages = session.settings.stages[ index ],
                    trial = {
                        bias,
                        data: _.times(stages.length, () => []),
                        index,
                        number,
                        session: session._id,
                        stages,
                        timeOrigin
                    };

                /** Generate trial locally: */
                instance.trials.push(trial);

                /** Queue trial insertion in database: */
                eventBus.emit('trial:add', trial);
            },
            count: (i) => (_.filter(instance.trials, (t) => (t.index === i)).length),
            initialize: (origin) => {
                const storage = instance.storage.get();

                instance.trials[ 0 ] = update(instance.trials[ 0 ], {
                    timeOrigin: { $set: origin },
                    storage: { $set: structuredClone(storage) }
                });
            },
            record: (e) => {
                /** If session aborts prematurely, save events to default first trial: */
                const n = Math.max(instance.n.get(), 0),
                    s = Math.max(instance.stage.get() - 1, 0),
                    session = instance.session.get()._id,
                    trial = instance.trials[ n ];

                if (!trial) return console.warn('Missing local trial', n, e);

                /** Save to local store for fast historical referencing: */
                trial.data[ s ].push(e);

                /** Save to database for long-term storage: */
                eventBus.emit('trial:update', { dest: 'data', session, trial: n + 1, stage: s + 1, payload: e });
            }
        };


    return { mqtt, storage, trial };
}
