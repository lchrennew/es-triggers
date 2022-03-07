import DomainEvent from "./domain-event.js";

export default class ListenerInternalError extends DomainEvent {
    context;

    constructor(context, error) {
        super({ eventID: context.eventID, error });
        this.context = context;
    }


    get keys() {
        const { listener } = this.context
        return [ `listeners`, `listeners:${listener}`, `listeners:${listener}:error` ]
    }
}
