import './subjects.html';

import {Template} from 'meteor/templating';
import {Subjects} from '../../../api/collections';

Template.subjectsDropdown.helpers({
    encrypt(id) {
        const cipher = Template.instance().parent(2).cipher;
        if (cipher) {
            const stored = _.find(_.invert(cipher), (value, key) => key === id),
                encrypted = stored || _.uniqueId('subject_');

            cipher[encrypted] = id;
            return encrypted;
        }
    },
    subject() {
        return Subjects.find({}, {sort: {identifier: 1}});
    }
});

Template.subjectsDropdown.onCreated(function () {
    const experiment = Template.instance().parent(2).data._id;
    this.autorun(() => {
        /** Subscribe only to shared templates: */
        this.subscribe('subjects.experiment', experiment);
    });
});

Template.subjectsDropdown.onRendered(function () {
    $('[name^=device_]').dropdown();
});
