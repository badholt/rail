/**
 * api/server.methods.js
 *
 * Purpose:
 *  - Server-side RPC layer (Meteor methods) for experiments, sessions, trials, & users
 *  - Central persistence interface for client-triggered actions
 *
 * Responsibilities:
 *  - CRUD operations for core domain objects (Experiments, Sessions, Trials, Subjects, Templates)
 *  - Session lifecycle orchestration (queueing, aborting, progression hooks)
 *  - User ↔ experiment authorization management
 *  - Trial persistence updates from runtime engine events
 *
 * Notes:
 *  - This is the primary server-side entry point for client state mutations
 *  - Many methods are called indirectly from runtime engine via eventBus
 * */

import './client.methods';

import { Meteor } from 'meteor/meteor';
import moment from 'moment/moment';
import _ from 'underscore';
import { Clients, Experiments, Sessions, Subjects, Templates, Trials } from './collections';

if (Meteor.isServer) Meteor.methods({
    'abortSession': (commands, user) => {
        const pointer = user?.status?.active?.session?.pointer;

        if (Number.isFinite(pointer)) Meteor.users.update(user._id, {
            $push: {
                'status.active.session.queue': {
                    $each: commands,
                    $position: pointer + 1
                }
            },
            $inc: { 'status.active.session.pointer': 1 }
        });
    },
    'addExperiment': async (fields) => {
        try {
            const template = Templates.findOne(fields.template), // Verify template exists
                link = await Meteor.callAsync('getExperimentLink', _.isEmpty(fields.link) ? fields.title : fields.link);

            return Experiments.insert({
                investigator: {
                    id: Meteor.userId(),
                    name: {
                        first: fields[ 'investigator-first' ],
                        last: fields[ 'investigator-last' ]
                    }
                },
                link,
                templates: [ template._id ],
                title: fields.title,
                users: [ Meteor.userId() ]
            });
        } catch (error) { console.error(error); }
    },
    'addSession': (device, experiment, inputs, session, subjects, trials) => Sessions.insert({
        date: new Date(),
        device: device,
        experiment: experiment,
        settings: { inputs: inputs, session: session, stages: trials },
        subjects: subjects,
        trials: [],
        user: Meteor.userId()
    }),
    'addSubject': (fields) => Subjects.insert({
        birthday: fields.birthday,
        description: fields.description,
        experiments: fields.experiments,
        identifier: fields.identifier,
        name: fields.name,
        protocol: fields.protocol,
        sex: fields.sex,
        strain: fields.strain,
        tags: fields.tags,
        users: [ Meteor.userId() ]
    }),
    'addTemplate': (template) => Templates.insert({
        _id: template._id || Random.id(),
        author: Meteor.userId() || template.author,
        devices: 'any',
        icon: template.icon,
        inputs: template.inputs,
        name: template.name,
        number: template.number,
        session: template.session,
        stages: template.stages,
        users: (template.users) ? template.users : [ Meteor.userId() ]
    }),
    'addTrial': (id, index, number, origin, bias) => {
        const session = Sessions.findOne(id),
            stages = session.settings.stages[index];

        if (stages) {
            const trial = Trials.insert({
                bias,
                data: Array.from(stages, () => []),
                date: new Date(),
                experiment: session.experiment,
                index: index,
                number: number,
                session: id,
                stages: stages,
                subjects: session.subjects,
                timeOrigin: origin
            });

            if (trial) Meteor.call('updateSession', id, 'trials', trial);
            return trial;
        }
    },
    'addUser': (username, id) => Meteor.users.update({ 'profile.username': username }, {
        $push: { 'profile.experiments': id }
    }),
    'advanceQueuePointer': (user) => {
        Meteor.users.update(user, { $inc: { 'status.active.session.pointer': 1 } });
    },
    'getExperimentLink': async (str) => {
        const link = str.replace(/( )|(\W)/g, '-'),
            matches = Experiments.find({ link: { $regex: `${ link }$` } }).count();

        return matches ? `${ link }-${ matches + 1 }` : link;
    },
    'getTemplates': (ids, params) => Templates.find(ids, params).fetch(),
    'getTrial': (dest, session, trial, stage, payload) => {
        const id = Sessions.findOne(session)?.trials[ trial - 1 ];

        if (!id) {
            console.warn('Missing trial id', { session, trial, stage });
            return;
        }

        switch (dest) {
            case 'data':{
                Meteor.callAsync('updateTrial', id, `data.${ stage - 1 }`, 'push', payload);
                break;
            }
            case 'storage': {
                const { key, value } = payload;

                if (key) Meteor.callAsync('updateTrial', id, `storage.${ key }`, 'set', value);
                break;
            }
        }
    },
    'removeExperiment': async (_id) => Experiments.remove({ _id }, (error) => {
        if (error) return console.error(error);

        /** Remove all links to & known associations w/ experiment: */
        Meteor.users.update({}, { $pull: { 'profile.experiments': _id } }, { multi: true });
        Subjects.update({}, { $pull: { experiments: _id } });
    }),
    'removeTemplate': (_id) => Templates.remove({ _id }, (error) => {
        if (!error) Experiments.update({}, { $pull: { templates: _id } }, { multi: true });
    }),
    'removeSession': (_id) => Sessions.remove({ _id }),
    'removeTrials': (ids) => Trials.remove({ _id: { $in: ids } }),
    'removeUser': (username, id) => Meteor.users.update({ 'profile.username': username }, {
        $pull: { 'profile.experiments': id }
    }),
    'setDefaultTemplate': (id, template) => {
        Experiments.update(id, { $pull: { templates: template } });
        Experiments.update(id, { $push: { templates: template } });
    },
    'updateAuthorized': (experiment, values) => {
        const users = Meteor.users.find({ 'profile.username': { $in: values.users } }).fetch(),
            ids = _.pluck(users, '_id'),
            add =  _.difference(ids, experiment.users),
            remove = _.difference(experiment.users, ids);

        add.forEach((id) => {
            Meteor.call('removeUser', id, experiment._id);
            Meteor.call('updateUser', id, 'profile.experiments', 'pull', experiment._id);
        });
        remove.forEach((id) => {
            Meteor.call('addUser', id, experiment._id);
            Meteor.call('updateUser', id, 'profile.experiments', 'addToSet', experiment._id);
        });

        Experiments.update(experiment._id, { $set: { users: ids } });

        const added = Meteor.users.find({ _id: { $in: add } }, { fields: { 'profile.name': 1 } }).fetch(),
            removed = Meteor.users.find({ _id: { $in: remove } }, { fields: { 'profile.name': 1 } }).fetch();

        return {
            added: _.map(added, (u) => (u.profile.name)),
            removed: _.map(removed, (u) => (u.profile.name))
        };
    },
    'updateClient': (_id, msg, retained) => Clients.upsert({ _id }, {
        $set: { ...msg, retained }
    }),
    'updateExperiment': (_id, fields) => Experiments.update({ _id }, {
        $currentDate: { lastModified: true },
        $set: {
            link: fields.link,
            title: fields.title
        }
    }),
    'updateProfile': (_id, fields) => Meteor.users.update({ _id }, {
        $currentDate: { lastModified: true },
        $set: _.object(_.map(fields, (v, k) => ([ `profile.${ k }`, v ])))
    }),
    'updateSession': (session, key, value) => {
        if (key === 'trials') {
            Sessions.update(session, { $currentDate: { lastModified: true }, $push: { trials: value } });
        } else {
            Sessions.update(session, { $currentDate: { lastModified: true }, $set: { [ key ]: value } });
        }
    },
    'updateSubject': (_id, fields) => Subjects.update({ _id }, {
        $currentDate: { lastModified: true },
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
    }, { multi: true }),
    'updateTrial': (_id, key, operation, value) => Trials.update({ _id }, {
        $currentDate: { lastModified: true }, [`$${ operation }`]: { [ key ]: value }
    }, { multi: true }),
    'updateUser': (_id, key, operation, value) => Meteor.users.update({ _id }, {
        $currentDate: { lastModified: true }, [ `$${ operation }` ]: { [ key ]: value }
    }),
    'updateUserByUsername': (username, key, operation, value) => Meteor.users.update({ username }, {
        $currentDate: { lastModified: true }, [ `$${ operation }` ]: { [ key ]: value }
    })
});
