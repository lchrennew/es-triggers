import DomainEvent from "./domain-event.js";

export default class TargetInterceptorInternalError extends DomainEvent {

    constructor({ eventID, listener, trigger, targetRequest, targetInterceptor }, error) {
        super({ eventID, listener, trigger, targetRequest, targetInterceptor, error });
    }
}
