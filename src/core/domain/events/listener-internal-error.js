import DomainEvent from "./domain-event.js";

export default class ListenerInternalError extends DomainEvent {
    constructor(error, ...chain) {
        super(error, ...chain);
    }
}
