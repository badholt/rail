import {Meteor} from 'meteor/meteor';
import '/imports/api/collections';

Meteor.subscribe('experiments');
Meteor.subscribe("sessions");
Meteor.subscribe("trials");

/** Throws error for unallowed write (no id)! */
// ServiceConfiguration.configurations.upsert(
//     {service: 'Google'},
//     {
//         $set: {
//             loginStyle: "popup",
//             clientId: "1292962797",
//             secret: "75a730b58f5691de5522789070c319bc"
//         }
//     }
// );
