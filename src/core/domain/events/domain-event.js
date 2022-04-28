import { getLogger } from "koa-es-template";
import { generateObjectID } from "es-object-id";
import { redis } from "../../../utils/redis.js";


const logger = getLogger('DOMAIN_EVENT')
export default class DomainEvent {
    eventID = generateObjectID()

    chain = [];
    content;
    type;

    constructor(content, ...chain) {
        this.content = content;
        this.chain = chain
        this.type = this.constructor.name
    }

    flush() {
        const key = `{trigger-event}:${this.chain[0] || this.eventID}`
        const field = [ ...this.chain, this.eventID ].join('/')
        const value = JSON.stringify(this)
        redis.hset(key, field, value)
        logger.info(this.constructor.name, field)
    }
}
