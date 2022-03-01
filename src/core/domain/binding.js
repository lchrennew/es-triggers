import { DomainModel } from "./domain-model.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import BindingInternalError from "./events/binding-internal-error.js";

export default class Binding extends DomainModel {

    static kind = 'binding'

    constructor(name, metadata, { script }) {
        super(Binding.kind, name, metadata, { script });
    }

    async bind(sourceEvent) {
        try {
            const script = `async ({ listener, trigger, method, query, headers, body, eventID })=>\
        { const variables={}; ${this.spec.script}; return variables; }`
            const { bind } = await importNamespace(exportName('bind', script))
            return await bind(sourceEvent)
        } catch (error) {
            this.onError(sourceEvent, error);
        }
    }

    onError(sourceEvent, error) {
        const bindingInternalError = new BindingInternalError(sourceEvent, error)
        bindingInternalError.flush()
    }
}
