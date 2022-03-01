import DomainEvent from "./domain-event.js";

export default class TriggerInternalError extends DomainEvent {
    constructor({ eventID, listener, trigger }, error) {
        super({ eventID, listener, trigger, error });
    }

    get keys() {
        const { listener, trigger } = this.content
        return [
            `listeners`, `listeners:${listener}`, `listeners:${listener}:error`, `listeners:${listener}:triggers`,
            `triggers:${trigger}`, `triggers:${trigger}:error`, ]
    }
}
