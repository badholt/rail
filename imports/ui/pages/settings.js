import './settings.html';

import '/imports/ui/components/dropdown/authorized';
import '/imports/ui/components/dropdown/template';

import { alert } from './run';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Templates } from '../../api/collections';

Template.settingsForm.events({
    'submit .form'(e) {
        e.preventDefault();

        const target = e.target || e.srcElement,
            values = $(`#${ target.getAttribute('id') }`).form('get values');

        Meteor.call('updateAuthorized', this, values, (err, res) => {
            if (!err) {
                _.each(res.added, (u) =>
                    alert('success', 'Experiment Updated', `${ u } added to authorized users.`));
                _.each(res.removed, (u) =>
                    alert('success', 'Experiment Updated', `${ u } removed from authorized users.`));
            }
        });
    }
});

Template.settingsForm.onRendered(() => $('.ui.form').form({ fields: { users: 'notEmpty' } }));

Template.templateItem.events({
    'click .delete.icon:not(.disabled)'(_e, template) {
        Meteor.call('removeTemplate', template.data._id);
    },
    'click .star.icon'(_e, template) {
        const experiment = template.parent(2);
        Meteor.call('setDefaultTemplate', experiment.data._id, template.data._id);
    }
});

Template.templateItem.helpers({
    current(id) {
        const experiment = Template.instance().parent();
        if (experiment?.data.templates) return (_.last(experiment.data.templates) === id);
    },
    default(users) {
        return _.contains(users, 'any');
    }
});

Template.templateList.helpers({
    templates() {
        return Templates.find({}, { sort: { name: 1 } });
    }
});

Template.templateList.onCreated(function () {
    /** Subscribes to all experiments accessible with user permissions,
     *  recomputes when user ID changes (i.e. login/logout) */
    this.autorun(() => this.subscribe('templates.user', Meteor.userId()));
});
