import { DomainModel } from "./domain-model.js";
import { get, getAll } from "../infrastructure/storage/index.js";
import Binding from "./binding.js";
import { TargetSystem } from "./target-system.js";
import Template from "./template.js";
import SourceInterceptor from "./source-interceptor.js";
import TargetInterceptor from "./target-interceptor.js";
import TargetRequest from "./target-request.js";

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
    async getBinding() {
        return this.#binding ??= await get(Binding, this.spec.binding)
    }

    /**
     *
     * @return {Promise<TargetSystem>}
     */
    async getTargetSystem() {
        return this.#targetSystem ??= await get(TargetSystem, this.spec.targetSystem)
    }

    /**
     *
     * @return {Promise<Template>}
     */
    async getTemplate() {
        return this.#template ??= await get(Template, this.spec.template)
    }

    /**
     *
     * @return {Promise<SourceInterceptor>}
     */
    async getSourceInterceptor() {
        return this.#sourceInterceptor ??= await get(SourceInterceptor, this.spec.sourceInterceptor)
    }

    /**
     *
     * @return {Promise<TargetInterceptor>}
     */
    async getTargetInterceptor() {
        return this.#targetInterceptor ??= await get(TargetInterceptor, this.spec.targetInterceptor)
    }

    /**
     *
     * @return {Promise<TargetRequest[]>}
     */
    async getTargetRequests() {
        return this.#targetRequests ??= await getAll(TargetRequest, this.name)
    }

    async invoke(context) {
        const sourceIntercepted = await this.interceptSource(context);
        if (sourceIntercepted) return
        const variables = await this.bindVariables(context);
        const targetRequests = await this.getTargetRequests()
        await this.triggerAll(targetRequests, { ...context, variables, });
    }

    async bindVariables(context) {
        const binding = await this.getBinding()
        return await binding.bind({ ...context, binding: binding.name, });
    }

    async interceptSource(context) {
        const sourceInterceptor = await this.getSourceInterceptor()
        return sourceInterceptor.intercept({ ...context, sourceInterceptor: sourceInterceptor.name });
    }

    async triggerAll(targetRequests, context) {
        const targetInterceptor = await this.getTargetInterceptor()
        const targetSystem = await this.getTargetSystem()
        const template = await this.getTemplate()

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
