import DomainEvent from "./domain-event.js";

export default class ListenerNotFound extends DomainEvent {
    constructor(listener, error, ...chain) {
        super({ listener, error }, ...chain);
    }
}
