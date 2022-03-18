import { Controller } from "koa-es-template";
import Client from "../../core/domain/client.js";

export default class Triggers extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/:name', this.getTriggersByTargetSystem)
    }

    async getTriggersByTargetSystem(ctx) {
        const { name } = ctx.params
        const client = new Client(name)
        ctx.body = await client.getTriggers().catch(() => [])
    }


}
