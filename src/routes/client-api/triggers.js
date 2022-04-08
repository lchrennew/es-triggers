import { Controller } from "koa-es-template";
import Client from "../../core/domain/client.js";

export default class Triggers extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);

        this.get('/:targetSystem', this.getTriggersByTargetSystem)
    }

    async getTriggersByTargetSystem(ctx) {
        const { targetSystem } = ctx.params
        const client = new Client(targetSystem)
        ctx.body = await client.getTriggers()
            .catch(error => {
                this.logger.error(error)
                return []
            })
    }


}
