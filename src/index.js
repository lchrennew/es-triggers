import { startServer } from "koa-es-template";
import Index from "./routes/index.js";
import { use } from "es-fetch-api";
import fetch from "node-fetch";

use(fetch)
await startServer({
    index: Index,
    preRouterHook: app => app.use(async (ctx, next) => {
        ctx.state.username = 'admin'
        await next()
    }),
})

