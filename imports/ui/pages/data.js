import './run.html';
import '/imports/ui/components/data.html';
import '/imports/ui/components/tablesort';

import {Template} from 'meteor/templating';
import {Sessions, Trials} from '/imports/api/collections';

Template.clickList.helpers({
    stage() {
        return [{title: 'Cross', helper: this.stages[0].data},
            {title: 'Lines', helper: this.stages[1].data}];
    }
});

Template.data.helpers({
    trials() {
        console.log(this);
        return Trials.find({experiment: this._id, subject: 'MouseID'});
    }
});

Template.data.onCreated(function () {
    console.log(this);
});

Template.data.onRendered(function () {
    $('table').tablesort();
});
