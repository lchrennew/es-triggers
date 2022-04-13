import Trigger from "./trigger.js";
import TriggerInternalError from "./events/trigger-internal-error.js";
import { getLogger } from "koa-es-template";
import { client } from "../infrastructure/cac/client.js";
import { ofType } from "../../utils/objects.js";
import { DomainModel } from "es-configuration-as-code-client";

const logger = getLogger('LISTENER')

export default class Listener extends DomainModel {
    static kind = 'listener'

    /**
     *
     * @param name {string}
     * @param title {string}
     * @param triggers {string[]}
     */
    constructor(name, { title }, { triggers = [] }) {
        super(Listener.kind, name, { title }, { triggers });
    }

    /**
     *
     * @return {Promise<Trigger[]>}
     */
    async #getTriggers() {
        const kind = Trigger.kind
        return ofType(await client.getMultiple(
            this.spec.triggers.map(name => ({ kind, name }))
        ), Trigger)
    }

    async invoke(context) {
        const triggers = await this.#getTriggers()
        triggers.forEach(
            trigger => trigger.invoke({ ...context, trigger: trigger.name })
                .catch(this.#onError(context, trigger))
        )
    }

    #onError(context, trigger) {
        return error => {
            const triggerInternalError = new TriggerInternalError({ ...context, trigger: trigger.name }, error)
            triggerInternalError.flush()
        };
    }
}
