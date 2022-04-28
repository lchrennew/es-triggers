import './utils/objects.js'
import { startServer } from "koa-es-template";
import Index from "./routes/index.js";

await startServer({
    index: Index,
    preRouterHook: app => app.use(async (ctx, next) => {
        ctx.state.username = 'admin'
        await next()
    }),
})

