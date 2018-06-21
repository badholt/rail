import './menu.html';
import '/imports/api/collections';
import {Template} from 'meteor/templating';
import {Experiments, Trials} from "../../api/collections";

Template.menu.helpers({
    experiment() {
        return Template.instance().experiments();
    },
    url() {
        return this.link;
    }
});

Template.menu.onCreated(function () {
    this.autorun(() => {
        this.experiments = function () {
            return Experiments.find({});
        };

        this.subscribe('experiments.user');
    });
});
