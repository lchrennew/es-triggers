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

        ctx.body = keys.reduce((acc, cur) => {
            const path = cur.split('/')
            let node = acc
            for (const dir of path) {
                node.subsequences ??= {}
                node.subsequences[dir] ??= JSON.parse(result[cur])
                node = node.subsequences[dir]
            }
            return acc
        }, rootEvent)
        ctx.status = 200
    }
}
