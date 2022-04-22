import DomainEvent from "./domain-event.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('SOURCE-REQUEST-INTERCEPTED')
export default class SourceRequestIntercepted extends DomainEvent {
    flush() {
        if (this.content.passed) logger.info(`${this.name} [PASSED]`)
        else logger.warn(`${this.name} [REFUSED]`)
        super.flush();
    }
}
