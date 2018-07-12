/** Fix for removal of global Buffer reference in Meteor 1.5 beta 17,
 *  which is required in many packages, such as MQTT: */
import {Buffer} from 'buffer';
// Was previously:
// global.Buffer = global.Buffer || require("buffer").Buffer;
global.Buffer = global.Buffer || Buffer;
