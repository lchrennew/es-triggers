import Binding from "./binding.js";
import { TargetSystem } from "./target-system.js";
import Template from "./template.js";
import SourceInterceptor from "./source-interceptor.js";
import TargetInterceptor from "./target-interceptor.js";
import TargetRequest from "./target-request.js";
import { getLogger } from "koa-es-template";
import { client } from "../infrastructure/cac/client.js";
import { ofType } from "../../utils/objects.js";
import { DomainModel } from "es-configuration-as-code-client";
import TriggerInternalError from "./events/trigger-internal-error.js";
import TriggerInvoked from "./events/trigger-invoked.js";

const logger = getLogger('TRIGGER')

export default class Trigger extends DomainModel {
    static kind = 'trigger'

    #sourceInterceptor
    #targetInterceptor
    #template
    #binding
    #targetSystem
    #targetRequests

    constructor(name, { title }, { sourceInterceptor, targetInterceptor, template, binding, targetSystem }) {
        super(Trigger.kind, name, { title }, { sourceInterceptor, targetInterceptor, template, binding, targetSystem });
    }

    /**
     *
     * @return {Promise<Binding>}
     */
    async #getBinding() {
        return this.#binding ??= ofType(await client.getOne(Binding.kind, this.spec.binding), Binding)
    }

    /**
     *
     * @return {Promise<TargetSystem>}
     */
    async #getTargetSystem() {
        return this.#targetSystem ??=
            ofType(await client.getOne(TargetSystem.kind, this.spec.targetSystem), TargetSystem)
    }

    /**
     *
     * @return {Promise<Template>}
     */
    async #getTemplate() {
        return this.#template ??= ofType(await client.getOne(Template.kind, this.spec.template), Template)
    }

    /**
     *
     * @return {Promise<SourceInterceptor>}
     */
    async #getSourceInterceptor() {
        return this.#sourceInterceptor ??=
            ofType(await client.getOne(SourceInterceptor.kind, this.spec.sourceInterceptor), SourceInterceptor)
    }

    /**
     *
     * @return {Promise<TargetInterceptor>}
     */
    async #getTargetInterceptor() {
        return this.#targetInterceptor ??=
            ofType(await client.getOne(TargetInterceptor.kind, this.spec.targetInterceptor), TargetInterceptor)
    }


    /**
     *
     * @param namespace
     * @return {Promise<TargetRequest[]>}
     */
    async #getTargetRequests(namespace = '') {
        return this.#targetRequests ??=
            ofType(await client.find(TargetRequest.kind, `${this.name}/${namespace}`), TargetRequest)
    }

    async invoke(context) {
        const triggerInvoked = new TriggerInvoked(this, ...context.chain)
        triggerInvoked.flush()
        context.chain = [ ...context.chain, triggerInvoked.eventID ]

        try {
            const sourceIntercepted = await this.#interceptSource(context);
            if (!sourceIntercepted?.content.passed) return

            context.chain = [ ...context.chain, sourceIntercepted.eventID ]
            const bindingBound = await this.#bindVariables(context);
            if (!bindingBound) return

            const variables = bindingBound.content
            context.chain = [ ...context.chain, bindingBound.eventID ]
            const targetRequests = await this.#getTargetRequests(variables['~'])
            logger.debug(this.name, 'target requests', targetRequests)

            await this.#triggerAll(targetRequests, context);
        } catch (error) {
            logger.error(error)
            const triggerInternalError = new TriggerInternalError(error, ...context.chain)
            triggerInternalError.flush()
        }
    }

    async #bindVariables(context) {
        const binding = await this.#getBinding()
        return await binding.bind(context);
    }

    async #interceptSource(context) {
        const sourceInterceptor = await this.#getSourceInterceptor()
        return await sourceInterceptor.intercept({ ...context, sourceInterceptor: sourceInterceptor.name });
    }

    async #triggerAll(targetRequests, context) {
        const targetInterceptor = await this.#getTargetInterceptor()
        const targetSystem = await this.#getTargetSystem()
        const template = await this.#getTemplate()

        targetRequests.forEach(
            targetRequest => targetRequest.trigger(context, targetInterceptor, targetSystem, template,))
    }

}
