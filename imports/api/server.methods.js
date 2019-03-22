import './client.methods';

import {Experiments, Sessions, Subjects, Templates, Trials} from './collections';
import {Meteor} from 'meteor/meteor';

import moment from 'moment/moment';
import NanoTimer from 'NanoTimer';
// TODO: Use mqtt imports instead of require?
const mqtt = require('mqtt');

if (Meteor.isServer) Meteor.methods({
    'addExperiment': (fields) => {
        const template = Templates.findOne({
            $and: [{name: fields.template},
                {$or: [{users: 'any'}, {users: {$elemMatch: {$eq: Meteor.userId()}}}]}]
        });
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
    'addSession': (device, experiment, form) => Sessions.insert({
        date: new Date(),
        device: device,
        experiment: experiment,
        settings: form,
        subject: 'MouseID',
        trials: [],
        user: Meteor.userId()
    }),
    'addSubject': (age, id, protocol, sex, strain) => Subjects.insert({
        birthday: moment().subtract(age, 'days').calendar(),
        identifier: id,
        protocol: protocol,
        sex: sex,
        strain: strain
    }),
    'addTemplate': (template) => Templates.insert({
        author: Meteor.userId(),
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
            stages = session.settings.stages[number - 1],
            trial = Trials.insert({
                data: Array.from(stages, () => []),
                date: new Date(),
                experiment: session.experiment,
                number: number,
                session: id,
                stages: stages,
                subject: 'MouseID'
            });
        console.log(trial);

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
    'updateTrial': (id, key, operation, value) => Trials.update({_id: id},
        {
            $currentDate: {
                lastModified: true
            },
            ['$' + operation]: {
                [key]: value
            }
        }, {multi: true})
});
