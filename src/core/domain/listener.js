import { DomainModel } from "./domain-model.js";
import { getAllByNames } from "../infrastructure/storage/index.js";
import Trigger from "./trigger.js";
import TriggerInternalError from "./events/trigger-internal-error.js";

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
    #getTriggers() {
        return getAllByNames(Trigger, this.spec.triggers)
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
