import DomainEvent from "./domain-event.js";

export default class ListenerRequested extends DomainEvent {
    get keys() {
        const { listener } = this.content
        return [ `listeners`, `listeners:${listener}`, `listeners:${listener}:request-in` ]
    }
}
