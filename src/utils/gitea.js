import { getLogger } from "koa-es-template";
import { getApi } from "es-fetch-api";
import { encode } from "./encode.js";
import { compile } from "path-to-regexp";

const logger = getLogger('gitea')

const token = process.env.GITEA_TOKEN
const auth = async (ctx, next) => {
    ctx.header('Authorization', `token ${token}`)
    return await next()
}

export const sudo = username => async (ctx, next) => {
    ctx.header('Sudo', username)
    return next()
}

export const request = (...args) => {
    const api = getApi(`${process.env.GITEA_API}/api/v1`)
    return api(...args, auth)
}

/**
 * 用户认证中间件
 * @param username
 * @param password
 * @return {function(*, *): *}
 */
export const userAuth = (username, password) => async (ctx, next) => {
    ctx.header('Authorization', `Basic ${encode(`${username.toLowerCase()}:${password}`, 'utf-8', 'base64')}`)
    return next()
}

export const params = params => async (ctx, next) => {
    const toPath = compile(ctx.url.pathname, { encode: encodeURIComponent })
    ctx.url.pathname = toPath(params)
    return await next()
}

/**
 * 简单调用Gitea API
 * @param endpoint
 * @param args
 * @return {Promise<undefined|*>}
 */
export const api = async (endpoint, ...args) => {
    const response = await request(endpoint, ...args)
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
