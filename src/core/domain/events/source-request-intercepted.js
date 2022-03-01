import DomainEvent from "./domain-event.js";

export default class SourceRequestIntercepted extends DomainEvent {

    constructor({ eventID, listener, trigger, sourceInterceptor }) {
        super({ eventID, listener, trigger, sourceInterceptor });
    }

    get keys() {
        const {} = this.content
        return super.keys;
    }
}
