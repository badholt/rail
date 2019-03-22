import {Template} from "meteor/templating";
import moment from "moment/moment";

Template.registerHelpers({
    add(increment, index) {
        return index + increment;
    },
    formatDate(date, format) {
        return moment(date).format(format);
    },
    formatDecimal(number, places) {
        const float = parseFloat(number);
        if (float) return float.toFixed(places);
    },
    properties(object) {
        return _.map(object, (value, key) => ({key: key, value: value}));
    },
    range(start, stop, step) {
        return Math.abs(stop - start) > 0 ? _.map(_.range(start, stop, step), (i) => ({index: i, order: i + 1})) : [];
    },
    relativeDate(date) {
        return moment(date).fromNow();
    }
});
