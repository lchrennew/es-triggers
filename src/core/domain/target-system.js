import { DomainModel } from "./domain-model.js";
import { exec } from "../../utils/strings.js";
import { getApi } from "es-fetch-api";
import { POST } from "es-fetch-api/middlewares/methods.js";
import { query } from "es-fetch-api/middlewares/query.js";
import { json } from "es-fetch-api/middlewares/body.js";
import TargetSystemRequestedError from "./events/target-system-requested-error.js";
import TargetSystemRequested from "./events/target-system-requested.js";
import { useParams } from "../infrastructure/storage/github/clients/index.js";
import { brokerEnabled } from "../../utils/toggles.js";

export class TargetSystem extends DomainModel {
    static kind = 'target-system'

    constructor(name, { title }, { url }) {
        super(TargetSystem.kind, name, { title }, { url });
    }

    static #onRequestError(context, error) {
        const targetSystemRequestedError = new TargetSystemRequestedError(context, error)
        targetSystemRequestedError.flush()
    }

    static async #onFinished(context, result) {
        const targetSystemRequested = new TargetSystemRequested(context, result)
        targetSystemRequested.flush()
        if (brokerEnabled && context.query?.session) {
            const brokerApi = getApi(process.env.SOCKJS_BROKER_API)
            brokerApi('publish/:topic', useParams({ topic: context.query.session }), POST, json(result.response))
                .catch(error => console.error(error))
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
        return exec(this.spec.url, variables)
    }

    async commit(request, context) {
        const headers = obj => async (ctx, next) => {
            ctx.headers = { ...ctx.headers, ...obj }
            return next()
        }
        try {
            const baseURL = this.#getUrl(context.variables)
            const api = getApi(baseURL)

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
            TargetSystem.#onRequestError(context, error);
        }
    }
}
