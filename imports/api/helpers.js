import {Template} from "meteor/templating";
import moment from "moment/moment";

Template.registerHelpers({
    formatDate(date, format) {
        return moment(date).format(format);
    },
    range(start, stop, step) {
        return _.map(_.range(start, stop, step), (i) => ({index: i, order: i + 1}));
    }
});
