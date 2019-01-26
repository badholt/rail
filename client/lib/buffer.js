/** Fix for removal of global Buffer reference in Meteor 1.5 beta 17,
 *  which is required in many packages, such as MQTT: */
import {Buffer} from 'buffer';

global.Buffer = global.Buffer || Buffer;
