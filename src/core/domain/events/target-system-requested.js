import DomainEvent from "./domain-event.js";

export default class TargetSystemRequested extends DomainEvent {

    constructor({ eventID, listener, trigger, targetSystem, template, targetRequest }, result) {
        super({ eventID, listener, trigger, targetSystem, template, targetRequest, result });
    }
}
