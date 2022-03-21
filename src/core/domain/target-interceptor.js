import { DomainModel } from "./domain-model.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestIntercepted from "./events/target-request-intercepted.js";
import TargetInterceptorInternalError from "./events/target-interceptor-internal-error.js";


export default class TargetInterceptor extends DomainModel {
    static kind = 'target-interceptor'

    constructor(name, { title }, { script }) {
        super(TargetInterceptor.kind, name, { title }, { script });
    }

    static #onError(context, error) {
        const targetInterceptorInternalError = new TargetInterceptorInternalError(context, error)
        targetInterceptorInternalError.flush()
    }

    static #onIntercepted(context) {
        const targetRequestIntercepted = new TargetRequestIntercepted(context)
        targetRequestIntercepted.flush()
    }

    /**
     *
     * @return {Promise<void>}
     * @param context
     */
    async intercept(context) {
        try {
            const script = `async ({listener,trigger,props,variables,targetSystem,targetRequest})=>{\
            ${this.spec.script};\
            }`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(context)
            intercepted && TargetInterceptor.#onIntercepted(context);
            return intercepted
        } catch (error) {
            TargetInterceptor.#onError(context, error);
        }
    }
}
