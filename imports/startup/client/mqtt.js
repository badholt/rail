/**
 * imports/startup/client/mqtt.js
 *
 * Purpose:
 *  - Initializes MQTT connectivity at account login
 *  - Creates hub clients for experimenter accounts
 *  - Coordinates MQTT client ownership across browser tabs
 *
 * Notes:
 *  - Device accounts share a single MQTT client across all tabs
 *  - Experimenter accounts receive a dedicated hub connection
 * */

/** IMPORTS: */

import { generateId } from 'human-ids';
import { clients, connectClient, createClient, logConnect, onMessage } from '/imports/services/mqtt';


/** HUB MQTT: */

export let hub;

const hubs = new Map(),
    sessionId = generateId({ color: false, number: { min: 0, max: 99 }, separator: '_' }),
    createHub = (clientId) => {
        const client = connectClient(clientId, Meteor.settings.public.mqtt.host, {
                clean: true,
                connectTimeout: 10000,
                keepalive: 60,
                reconnectPeriod: 1000
            });

        client.on('connect', () => {
            client.subscribe([ 'clients/+/status', 'hub/+/response' ]);
            logConnect(clientId, Meteor.settings.public.mqtt.host);
        });

        client.on('message', onMessage);

        hubs.set(clientId, client);

        return client;
    },
    getHub = (id) => hubs.get(id) ?? createHub(id);


/** TAB COORDINATION: */

/** Coordinates browser tabs for a single device account.
 *  Only one tab acts as the primary MQTT owner at any given time. */
class UserTabs {
    constructor(id, username, onPrimary = () => {}, wait = 1000) {
        this.channel = new BroadcastChannel(username);
        this.id = id;
        this.onPrimary = onPrimary;
        this.primary;
        this.tabs = new Set([ id ]);
        this.version = 0;

        this.channel.onmessage = ({ data }) => this.dispatch(data);
        this.channel.postMessage({ type: 'open', tab: this.id });
        setTimeout(() => this.init(), wait);
    }

    close() {
        this.tabs.delete(this.id);
        this.version++;

        const [ primary ] = this.tabs;

        this.channel.postMessage({ type: 'sync', primary, tab: this.id, tabs: [ ...this.tabs ] });
        this.channel.close();
    }

    dispatch({ type, primary, tab, tabs, version }) {
        ({
            open: () => {
                this.tabs.add(tab);
                this.version++;
                this.channel.postMessage({ type: 'sync', primary: this.primary, tab: this.id, tabs: [ ...this.tabs ],
                    version: this.version });
            },
            sync: () => {
                if (version <= this.version) return;

                const transfer = this.primary !== this.id && primary === this.id;

                this.primary = primary;
                this.tabs = new Set(tabs);
                this.version = version;

                if (transfer) this.onPrimary?.();
            }
        })[ type ]?.();
    }

    init() {
        if (!this.primary || !this.tabs.has(this.primary)) {
            const [ primary ] = this.tabs;
            this.primary = primary;
        };

        this.version++;

        if (this.primary === this.id) this.onPrimary?.();
    }
}


const registerDeviceTab = (sessionId, username) => {
        const tabs = new UserTabs(sessionId, username, () => createClient(username));
        window.addEventListener('unload', () => tabs.close());
    };


/** DEVICE MQTT: */

Accounts.onLogin(() => {
    const { profile } = Meteor.user() || {},
        { device, username } = profile || {};

    if (!device) {
        hub ??= getHub(`hub_${ sessionId }`);
        return;
    }

    const client = clients.get(username);

    if (!username || client?.connected || client?.reconnecting) return;
    registerDeviceTab(sessionId, username);
});
