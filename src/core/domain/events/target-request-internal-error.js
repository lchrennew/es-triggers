import DomainEvent from "./domain-event.js";

export default class TargetRequestInternalError extends DomainEvent {

    constructor({ eventID, listener, trigger, targetRequest }, error) {
        super({ eventID, listener, trigger, targetRequest, error });
    }
}
