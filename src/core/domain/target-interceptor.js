import { DomainModel } from "./domain-model.js";
import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestIntercepted from "./events/target-request-intercepted.js";
import TargetInterceptorInternalError from "./events/target-interceptor-internal-error.js";


export default class TargetInterceptor extends DomainModel {
    static kind = 'target-interceptor'

    constructor(name, { title }, { script }) {
        super(TargetInterceptor.kind, name, { title }, { script });
    }

    /**
     *
     * @return {Promise<void>}
     * @param sourceRequest
     */
    async intercept(sourceRequest) {
        try {
            const script = `async ({listener,trigger,props,variables,targetSystem})=>{\
            ${this.spec.script};\
            }`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(sourceRequest)
            intercepted && this.onIntercepted(sourceRequest);
            return intercepted
        } catch (error) {
            this.onError(sourceRequest, error);
        }
    }

    onError(sourceRequest, error) {
        const targetInterceptorInternalError = new TargetInterceptorInternalError(sourceRequest, error)
        targetInterceptorInternalError.flush()
    }

    onIntercepted(sourceRequest) {
        const targetRequestIntercepted = new TargetRequestIntercepted(sourceRequest)
        targetRequestIntercepted.flush()
    }
}
