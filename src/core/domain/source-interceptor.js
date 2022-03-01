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
     * @param sourceRequest
     * @return {Promise<boolean>}
     */
    async intercept(sourceRequest) {
        try {
            const script = `async ({method,headers,body,query,listener, trigger})=>{${this.spec.script}}`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(sourceRequest)
            intercepted && this.onIntercepted(sourceRequest);
            return intercepted
        } catch (error) {
            this.onError(sourceRequest, error);
        }
        return true
    }

    onError(sourceRequest, error) {
        const sourceInterceptorInternalError = new SourceInterceptorInternalError(sourceRequest, error)
        sourceInterceptorInternalError.flush()
    }

    onIntercepted(sourceRequest) {
        const sourceRequestIntercepted = new SourceRequestIntercepted(sourceRequest)
        sourceRequestIntercepted.flush()
    }
}
