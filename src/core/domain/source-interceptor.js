import { DomainModel } from "./domain-model.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import SourceRequestIntercepted from "./events/source-request-intercepted.js";
import SourceInterceptorInternalError from "./events/source-interceptor-internal-error.js";

export default class SourceInterceptor extends DomainModel {
    static kind = 'source-interceptor'

    constructor(name, { title }, { script }) {
        super(SourceInterceptor.kind, name, { title }, { script });
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
            intercepted && this.onIntercepted(context);
            return intercepted
        } catch (error) {
            this.onError(context, error);
        }
        return true
    }

    onError(context, error) {
        const sourceInterceptorInternalError = new SourceInterceptorInternalError(context, error)
        sourceInterceptorInternalError.flush()
    }

    onIntercepted(context) {
        const sourceRequestIntercepted = new SourceRequestIntercepted(context)
        sourceRequestIntercepted.flush()
    }
}
