import { exec } from "../../utils/strings.js";
import { getApi } from "es-fetch-api";
import { POST } from "es-fetch-api/middlewares/methods.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { json } from "es-fetch-api/middlewares/body.js";
import TargetSystemInternalError from "./events/target-system-internal-error.js";
import TargetSystemResponded from "./events/target-system-responded.js";
import { useParams } from "../../utils/use-params.js";
import { brokerEnabled } from "../../utils/toggles.js";
import { getLogger } from "koa-es-template";
import { DomainModel } from "es-configuration-as-code-client";
import TargetSystemRequesting from "./events/target-system-requesting.js";

const logger = getLogger('TARGET-SYSTEM')

export class TargetSystem extends DomainModel {
    static kind = 'target-system'

    constructor(name, { title }, spec) {
        super(TargetSystem.kind, name, { title }, spec);
    }

    static async #onFinished(context, result) {
        const targetSystemResponded = new TargetSystemResponded(result, ...context.chain)
        targetSystemResponded.flush()
        context.chain = [ ...context.chain, targetSystemResponded.eventID ]
        if (brokerEnabled && context.query?.session) {
            const brokerApi = getApi(process.env.SOCKJS_BROKER_API)
            await brokerApi('publish/:topic', useParams({ topic: context.query.session }), POST, json(result.response))
        }
    }

    static async #responseToObject(response) {
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

    #getUrl(variables) {
        return exec(this.spec[variables['@'] || 'default'], variables)
    }

    async commit(request, context) {
        const headers = obj => async (ctx, next) => {
            ctx.headers = { ...ctx.headers, ...obj }
            return next()
        }
        try {
            const baseURL = this.#getUrl(context.variables)
            const api = getApi(baseURL)

            const targetSystemRequesting = new TargetSystemRequesting({ ...request, baseURL }, ...context.chain)
            targetSystemRequesting.flush()
            context.chain = [ ...context.chain, targetSystemRequesting.eventID ]

            const apiResponse =
                await api(
                    request.path,
                    POST,
                    query(request.query),
                    headers(request.headers),
                    headers({ 'X-TRIGGER-EVENT-ID': context.eventID }),
                    json(request.body))

            const response = await TargetSystem.#responseToObject(apiResponse);
            await TargetSystem.#onFinished(context, { baseURL, request, response })
        } catch (error) {
            const targetSystemInternalError = new TargetSystemInternalError(error, ...context.chain)
            targetSystemInternalError.flush()
        }
    }
}
