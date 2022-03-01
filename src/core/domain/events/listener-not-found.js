import DomainEvent from "./domain-event.js";

export default class ListenerNotFound extends DomainEvent {
    constructor({ eventID, listener }, error) {
        super({ eventID, listener, error });
    }
}
