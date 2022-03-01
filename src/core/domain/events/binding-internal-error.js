import DomainEvent from "./domain-event.js";

export default class BindingInternalError extends DomainEvent {
    constructor({ eventID, listener, trigger, binding }, error) {
        super({ eventID, listener, trigger, binding, error });
    }
}
