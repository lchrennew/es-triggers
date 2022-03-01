import DomainEvent from "./domain-event.js";

export default class ListenerInternalError extends DomainEvent {
    sourceRequest;

    constructor(sourceRequest, error) {
        super({ eventID: sourceRequest.eventID, error });
        this.sourceRequest = sourceRequest;
    }


    get keys() {
        const { listener } = this.sourceRequest
        return [ `listeners`, `listeners:${listener}`, `listeners:${listener}:error` ]
    }
}
