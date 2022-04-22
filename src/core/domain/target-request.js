import { exportName, importNamespace } from "../../utils/imports.js";
import TargetRequestInternalError from "./events/target-request-internal-error.js";
import { getLogger } from "koa-es-template";
import { DomainModel } from "es-configuration-as-code-client";
import TargetRequestTriggering from "./events/target-request-triggering.js";
import TargetRequestBinding from "./events/target-request-binding.js";
import TargetRequestBound from "./events/target-request-bound.js";

const logger = getLogger('target-request.js')

export default class TargetRequest extends DomainModel {
    static kind = 'target-request'

    constructor(name, { trigger }, { props, script }) {
        super(TargetRequest.kind, name, { trigger }, { props, script });
    }

    /**
     * 这个步骤是为了将每个不同目标请求上的props数据运用在variables上
     * @param context
     * @return {Promise<TargetRequestBound>}
     */
    async #bind(context) {
        const targetRequestBinding = new TargetRequestBinding(context, ...context.chain)
        targetRequestBinding.flush()
        context.chain = [ ...context.chain, targetRequestBinding.eventID ]

        try {
            const script = `async ({ listener, trigger, method, query, headers, body, props, variables })=>{\
        ${this.spec.script};\
        return variables;}`
            const { bind } = await importNamespace(exportName('bind', script))
            const variables = await bind({ ...context, variables: { ...context.variables } })

            const targetRequestBound = new TargetRequestBound(variables, ...context.chain)
            targetRequestBound.flush()
            return targetRequestBound
        } catch (error) {
            logger.error(error)
            const targetRequestInternalError = new TargetRequestInternalError(error, ...context.chain)
            targetRequestInternalError.flush()
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
        const targetRequestTriggering = new TargetRequestTriggering(this, ...context.chain)
        targetRequestTriggering.flush()

        context = {
            ...context,
            props: this.spec.props,
            targetRequest: this.name,
            targetInterceptor: targetInterceptor.name,
            targetSystem: targetSystem.name,
            template: template.name,
            chain: [ ...context.chain, targetRequestTriggering.eventID ]
        }

        try {
            const targetRequestIntercepted = await targetInterceptor.intercept(context)
            if (!targetRequestIntercepted?.content.passed) return

            context.chain = [ ...context.chain, targetRequestIntercepted.eventID ]
            await this.#sendTo(targetSystem, context, template);
        } catch (error) {
            logger.error(error)
            const targetRequestInternalError = new TargetRequestInternalError(error, ...context.chain)
            targetRequestInternalError.flush()
        }

    }

    /**
     *
     * @param targetSystem
     * @param context
     * @param template {Template}
     * @return {Promise<void>}
     */
    async #sendTo(targetSystem, context, template) {
        const targetRequestBound = await this.#bind(context)
        if (!targetRequestBound) return
        const variables = targetRequestBound.content
        const request = template.apply(variables)
        context.chain = [ ...context.chain, targetRequestBound.eventID ]
        targetSystem.commit(request, { ...context, variables })
    }
}
