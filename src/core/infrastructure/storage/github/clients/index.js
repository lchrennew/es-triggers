import { getLogger } from "koa-es-template";
import { getApi } from "es-fetch-api";
import { compile } from "path-to-regexp";

const vendor = process.env.GITHUB_LIKE_VENDOR

const logger = getLogger(vendor)

const { auth, baseUrl, repo, owner } = await import(`./${vendor}.js`)

const _ = getApi(baseUrl)

export const useParams = params => async (ctx, next) => {
    const toPath = compile(ctx.url.pathname, { validate: false })
    ctx.url.pathname = toPath(params)
    return await next()
}
export const log = async (ctx, next) => {
    logger.debug(ctx.method, ctx.url.href)
    return await next()
}
/**
 * 简单调用Gitee API
 * @param endpoint
 * @param args
 * @return {Promise<undefined|*>}
 */
export const api = async (endpoint, ...args) => {
    const response = await _(endpoint, ...args, auth, log)
    if (response.status < 400) {
        return response.status === 204 ? undefined : getBody(response).catch(error => {
            logger.error(error)
            return null
        })
    } else {
        const error = await getBody(response)
        const message = error.errors?.[0] ?? error.message ?? error
        logger.warn(`${response.status} ${response.context.method} ${response.context.url.href}: ${message}`)
        throw { message, status: response.status }
    }
}

const getBody = response => {
    if (response.headers.get('content-type')?.includes('json')) return response.json()
    return response.text()
}

export { repo, owner }
