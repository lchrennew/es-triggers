import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestInternalError from "./events/target-request-internal-error.js";
import { getLogger } from "koa-es-template";
import { DomainModel } from "es-configuration-as-code-client";

const logger = getLogger('target-request.js')

export default class TargetRequest extends DomainModel {
    static kind = 'target-request'

    constructor(name, { trigger }, { props, script }) {
        super(TargetRequest.kind, name, { trigger }, { props, script });
    }

    static #onError(sourceEvent, error) {
        const targetRequestInternalError = new TargetRequestInternalError(sourceEvent, error)
        targetRequestInternalError.flush()
    }

    async #bind(sourceEvent) {
        try {
            const script = `async ({ listener, trigger, method, query, headers, body, props, variables })=>{\
        ${this.spec.script};\
        return variables;}`
            const { bind } = await importNamespace(exportName('bind', script))
            return await bind({ ...sourceEvent, variables: { ...sourceEvent.variables } })
        } catch (error) {
            TargetRequest.#onError(sourceEvent, error);
        }
    }

    /**
     *
     * @param context
     * @param targetInterceptor
     * @param targetSystem
     * @param template
     * @return {Promise<void>}
     */
    async trigger(context, targetInterceptor, targetSystem, template,) {
        const targetIntercepted = await targetInterceptor.intercept(context)
        targetIntercepted || await this.#sendTo(targetSystem, context, template);
    }

    async #sendTo(targetSystem, context, template) {
        const variables = await this.#bind(context)
        const request = template.apply(variables)
        targetSystem.commit(request, { ...context, variables })
    }
}
