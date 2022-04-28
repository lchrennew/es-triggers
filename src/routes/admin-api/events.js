import { Controller } from "koa-es-template";
import { redis } from "../../utils/redis.js";

export default class Events extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/:id', this.getEventTree)
    }

    async getEventTree(ctx) {
        const { id } = ctx.params
        const result = await redis.hgetall(`{trigger-event}:${id}`)
        const keys = Object.keys(result).sort()
        const rootEvent = JSON.parse(result[keys.shift()])

        ctx.body = rootEvent
        keys.forEach(key => {
            let node = rootEvent
            const [ , ...path ] = key.split('/')
            path.forEach(dir => node = ((node.subsequences ??= {})[dir] ??= JSON.parse(result[key])))
        })

        ctx.status = 200
    }
}
