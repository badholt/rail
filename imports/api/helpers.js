import {Template} from "meteor/templating";
import moment from "moment/moment";

Template.registerHelpers({
    formatDate(date, format) {
        return moment(date).format(format);
    },
    formatDecimal(number, places) {
        const float = parseFloat(number);
        if (float) return float.toFixed(places);
    },
    range(start, stop, step) {
        return _.map(_.range(start, stop, step), (i) => ({index: i, order: i + 1}));
    },
    relativeDate(date) {
        return moment(date).fromNow();
    }
});
