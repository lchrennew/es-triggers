import { exportName, importNamespace } from "../../utils/imports.js";
import SourceRequestIntercepted from "./events/source-request-intercepted.js";
import SourceInterceptorInternalError from "./events/source-interceptor-internal-error.js";
import { DomainModel } from "es-configuration-as-code-client";

export default class SourceInterceptor extends DomainModel {
    static kind = 'source-interceptor'

    constructor(name, { title }, { script }) {
        super(SourceInterceptor.kind, name, { title }, { script });
    }

    static #onError(context, error) {
        const sourceInterceptorInternalError = new SourceInterceptorInternalError(context, error)
        sourceInterceptorInternalError.flush()
    }

    static #onIntercepted(context) {
        const sourceRequestIntercepted = new SourceRequestIntercepted(context)
        sourceRequestIntercepted.flush()
    }

    /**
     *
     * @param context
     * @return {Promise<boolean>}
     */
    async intercept(context) {
        try {
            const script = `async ({method,headers,body,query,listener, trigger})=>{${this.spec.script}}`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(context)
            intercepted && SourceInterceptor.#onIntercepted(context);
            return intercepted
        } catch (error) {
            SourceInterceptor.#onError(context, error);
        }
        return true
    }
}
