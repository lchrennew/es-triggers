import { encodeBase64 } from "../../../../../utils/encode.js";

const token = process.env.GITHUB_TOKEN
const username = process.env.GITHUB_USERNAME
export const auth = async (ctx, next) => {
    ctx.header('Authorization', `Basic ${encodeBase64(`${username}:${token}`)}`)
    return await next()
}

export const baseUrl = process.env.GITHUB_API

export const owner = process.env.GITHUB_SHARED_OWNER
export const repo = process.env.GITHUB_SHARED_REPO
