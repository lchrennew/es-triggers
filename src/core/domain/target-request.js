import { DomainModel } from "./domain-model.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestInternalError from "./events/target-request-internal-error.js";

export default class TargetRequest extends DomainModel {
    static kind = 'target-request'

    constructor(name, { trigger }, { props, script }) {
        super(TargetRequest.kind, name, { trigger }, { props, script });
    }

    async bind(sourceEvent) {
        try {
            const script = `async ({ listener, trigger, method, query, headers, body, props, variables })=>{\
        ${this.spec.script};\
        return variables;}`
            const { bind } = await importNamespace(exportName('bind', script))
            return await bind({ ...sourceEvent, variables: { ...sourceEvent.variables } })
        } catch (error) {
            this.onError(sourceEvent, error);
        }
    }

    onError(sourceEvent, error) {
        const targetRequestInternalError = new TargetRequestInternalError(sourceEvent, error)
        targetRequestInternalError.flush()
    }
}
