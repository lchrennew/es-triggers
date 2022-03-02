import { DomainModel } from "./domain-model.js";
import { get, getAll } from "../infrastructure/storage/index.js";
import Binding from "./binding.js";
import { TargetSystem } from "./target-system.js";
import Template from "./template.js";
import SourceInterceptor from "./source-interceptor.js";
import TargetInterceptor from "./target-interceptor.js";
import { getApi, json, query } from "es-fetch-api";
import TargetRequest from "./target-request.js";
import { POST } from "es-fetch-api/middlewares/methods.js";
import TargetSystemRequested from "./events/target-system-requested.js";
import TargetSystemRequestedError from "./events/target-system-requested-error.js";

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

    async process(sourceRequest) {
        const sourceIntercepted = await this.interceptSource(sourceRequest);
        if (sourceIntercepted) return
        const variables = await this.bindVariables(sourceRequest);
        await this.triggerAll({ ...sourceRequest, variables, });
    }


    async bindVariables(sourceRequest) {
        const binding = await this.getBinding()
        return await binding.bind({ ...sourceRequest, binding: binding.name, });
    }

    async interceptSource(sourceRequest) {
        const sourceInterceptor = await this.getSourceInterceptor()
        return sourceInterceptor.intercept({ ...sourceRequest, sourceInterceptor: sourceInterceptor.name });
    }

    async triggerAll(sourceRequest) {
        const targetRequests = await this.getTargetRequests()
        const targetInterceptor = await this.getTargetInterceptor()
        const targetSystem = await this.getTargetSystem()
        const template = await this.getTemplate()

        await Promise.all(
            targetRequests.map(targetRequest =>
                this.trigger(
                    {
                        ...sourceRequest,
                        props: targetRequest.spec.props,
                        targetRequest: targetRequest.name,
                        targetInterceptor: targetInterceptor.name,
                        targetSystem: targetSystem.name,
                        template: template.name,
                    },
                    targetRequest,
                    targetInterceptor,
                    targetSystem,
                    template,
                ))
        )
    }

    async trigger(sourceRequest, targetRequest, targetInterceptor, targetSystem, template) {
        const targetIntercepted = await targetInterceptor.intercept(sourceRequest)
        targetIntercepted || await this.requestTargetSystem(targetRequest, sourceRequest, targetSystem, template);
    }


    async requestTargetSystem(targetRequest, sourceRequest, targetSystem, template) {
        const variables = await targetRequest.bind(sourceRequest)
        const request = await template.apply(variables)
        const baseURL = await targetSystem.getUrl(variables)
        await this.post(baseURL, request, sourceRequest)
    }

    async post(baseURL, request, sourceRequest) {
        const api = getApi(baseURL)
        const headers = obj => async (ctx, next) => {
            ctx.headers = { ...ctx.headers, obj }
            return next()
        }
        try {
            const apiResponse =
                await api(
                    request.path,
                    POST,
                    query(request.query),
                    headers(request.headers),
                    headers({ 'X-TRIGGER-EVENT-ID': sourceRequest.eventID }),
                    json(request.body))

            const response = await this.responseToObject(apiResponse);
            this.onFinished(sourceRequest, { request, response })
        } catch (error) {
            this.onRequestError(sourceRequest, error);
        }
    }

    onRequestError(sourceRequest, error) {
        const targetSystemRequestedError = new TargetSystemRequestedError(sourceRequest, error)
        targetSystemRequestedError.flush()
    }

    async responseToObject(response) {
        const { headers, ok, redirected, status, statusText, url } = response
        const body = await response.text()
        return {
            ok,
            redirected,
            status,
            statusText,
            url,
            headers: Object.fromEntries(headers.entries()),
            body
        }
    }

    onFinished(sourceRequest, result) {
        const targetSystemRequested = new TargetSystemRequested(sourceRequest, result)
        targetSystemRequested.flush()
    }
}
