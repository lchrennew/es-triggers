import DomainEvent from "./domain-event.js";

export default class TargetRequestIntercepted extends DomainEvent {
    constructor({ eventID, listener, trigger, targetRequest, targetInterceptor }) {
        super({ eventID, listener, trigger, targetRequest, targetInterceptor });
    }
}
