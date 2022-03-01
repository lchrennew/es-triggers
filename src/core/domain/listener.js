import { DomainModel } from "./domain-model.js";
import { getAllByNames } from "../infrastructure/index.js";
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
    async getTriggers() {
        return await getAllByNames(Trigger, ...this.spec.triggers)
    }

    async invoke(sourceRequest) {
        const triggers = await this.getTriggers()
        triggers.forEach(
            trigger => trigger.process({ ...sourceRequest, trigger: trigger.name })
                .catch(this.onError(sourceRequest, trigger))
        )
    }

    onError(sourceRequest, trigger) {
        return error => {
            const triggerInternalError = new TriggerInternalError({ ...sourceRequest, trigger: trigger.name }, error)
            triggerInternalError.flush()
        };
    }
}
