import DomainEvent from "./domain-event.js";

export default class TargetSystemInternalError extends DomainEvent {

    constructor({ eventID, listener, trigger, targetRequest, targetSystem, template }, error) {
        super({ eventID, listener, trigger, targetRequest, targetSystem, template, error });
    }
}
