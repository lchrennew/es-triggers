import { getLogger } from "koa-es-template";
import { generateObjectID } from "es-object-id";

const logger = getLogger('DomainEvent')
export default class DomainEvent {
    eventID = generateObjectID()
    content;

    constructor(content) {
        this.content = content;
    }

    get keys() {
        return []
    }

    get type() {
        return this.constructor.name
    }

    flush() {
        logger.info({ ID: this.eventID, TYPE: this.type, CONTENT: this.content })
    }
}
