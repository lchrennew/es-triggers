import { DomainModel } from "./domain-model.js";
import Binding from "./binding.js";
import { TargetSystem } from "./target-system.js";
import Template from "./template.js";
import SourceInterceptor from "./source-interceptor.js";
import TargetInterceptor from "./target-interceptor.js";
import TargetRequest from "./target-request.js";
import { getLogger } from "koa-es-template";
import { client } from "../infrastructure/cac/client.js";
import { ofType } from "../../utils/objects.js";

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
        const sourceIntercepted = await this.#interceptSource(context);
        if (sourceIntercepted) {
            logger.debug(this.name, 'intercepted')
            return
        }
        logger.debug(this.name, 'not intercepted')
        const variables = await this.#bindVariables(context);
        logger.debug(this.name, 'variables', variables)
        const targetRequests = await this.#getTargetRequests(variables['~'])

        logger.debug(this.name, 'target requests', targetRequests)

        await this.#triggerAll(targetRequests, { ...context, variables, });
    }

    async #bindVariables(context) {
        const binding = await this.#getBinding()
        return await binding.bind({ ...context, binding: binding.name, });
    }

    async #interceptSource(context) {
        const sourceInterceptor = await this.#getSourceInterceptor()
        return sourceInterceptor.intercept({ ...context, sourceInterceptor: sourceInterceptor.name });
    }

    async #triggerAll(targetRequests, context) {
        const targetInterceptor = await this.#getTargetInterceptor()
        const targetSystem = await this.#getTargetSystem()
        const template = await this.#getTemplate()

        targetRequests.forEach(
            targetRequest =>
                targetRequest.trigger(
                    {
                        ...context,
                        props: targetRequest.spec.props,
                        targetRequest: targetRequest.name,
                        targetInterceptor: targetInterceptor.name,
                        targetSystem: targetSystem.name,
                        template: template.name,
                    },
                    targetInterceptor,
                    targetSystem,
                    template,
                ))
    }

}
