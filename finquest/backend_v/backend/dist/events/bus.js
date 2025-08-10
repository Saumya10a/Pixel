import { EventEmitter } from "events";
export const bus = new EventEmitter();
bus.setMaxListeners(1000);
export function publishToUser(userId, event) {
    bus.emit(`user:${userId}`, event);
}
