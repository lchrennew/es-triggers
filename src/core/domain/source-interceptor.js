import { exportName, importNamespace } from "../../utils/imports.js";
import SourceInterceptorInternalError from "./events/source-interceptor-internal-error.js";
import { DomainModel } from "es-configuration-as-code-client";
import { getLogger } from "koa-es-template";
import SourceRequestIntercepted from "./events/source-request-intercepted.js";
import SourceRequestIntercepting from "./events/source-request-intercepting.js";

const logger = getLogger('SOURCE-INTERCEPTOR')
export default class SourceInterceptor extends DomainModel {
    static kind = 'source-interceptor'

    constructor(name, { title }, { script }) {
        super(SourceInterceptor.kind, name, { title }, { script });
    }

    async intercept(context) {
        try {
            const sourceRequestIntercepting = new SourceRequestIntercepting(this, ...context.chain)
            sourceRequestIntercepting.flush()
            const script = `async ({method,headers,body,query,listener, trigger})=>{${this.spec.script}}`
            const { intercept } = await importNamespace(exportName('intercept', script))
            const intercepted = await intercept(context)

            const sourceRequestIntercepted = new SourceRequestIntercepted(
                { passed: !intercepted },
                ...context.chain, sourceRequestIntercepting.eventID)
            sourceRequestIntercepted.flush()
            return sourceRequestIntercepted
        } catch (error) {
            logger.error(error)
            const sourceInterceptorInternalError = new SourceInterceptorInternalError(error, ...context.chain)
            sourceInterceptorInternalError.flush()
        }
    }
}
