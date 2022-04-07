import { compile } from "path-to-regexp";

export const useParams = params => async (ctx, next) => {
    const toPath = compile(ctx.url.pathname, { validate: false })
    ctx.url.pathname = toPath(params)
    return await next()
}
