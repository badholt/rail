import {Sessions} from "../collections";

Sessions.rawCollection().createIndex({date: -1, device: 1}, {name: "scheduled sessions"});
