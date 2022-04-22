import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestIntercepted from "./events/target-request-intercepted.js";
import TargetInterceptorInternalError from "./events/target-interceptor-internal-error.js";
import { DomainModel } from "es-configuration-as-code-client";
import { getLogger } from "koa-es-template";
import TargetRequestIntercepting from "./events/target-request-intercepting.js";

const logger = getLogger('TARGET-INTERCEPTOR')
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
     * @param context
     * @return {Promise<TargetRequestIntercepted>}
     */
    async intercept(context) {
        const targetRequestIntercepting =
            new TargetRequestIntercepting(this, ...context.chain)
        targetRequestIntercepting.flush()
        context = { ...context, chain: [ ...context.chain, targetRequestIntercepting.eventID ] }

        try {
            const script = `async ({listener,trigger,props,variables,targetSystem,targetRequest})=>{\
            ${this.spec.script};\
            }`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(context)
            const targetRequestIntercepted = new TargetRequestIntercepted({ passed: !intercepted }, ...context.chain)
            targetRequestIntercepted.flush()
            return targetRequestIntercepted
        } catch (error) {
            logger.error(error)
            const targetInterceptorInternalError = new TargetInterceptorInternalError(error, ...context.chain)
            targetInterceptorInternalError.flush()
        }
    }
}
