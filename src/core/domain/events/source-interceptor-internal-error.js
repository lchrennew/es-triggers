import DomainEvent from "./domain-event.js";

export default class SourceInterceptorInternalError extends DomainEvent {
    constructor({ eventID, listener, trigger, sourceInterceptor }, error) {
        super({ eventID, listener, trigger, sourceInterceptor, error });
    }
}
