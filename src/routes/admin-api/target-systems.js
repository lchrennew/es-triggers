import { Controller } from "koa-es-template";
import Consumer from "../../core/domain/consumer.js";
import { TargetSystem } from "../../core/domain/target-system.js";

export default class TargetSystems extends Controller {

    constructor(config) {
        super(config);
        this.get('/', this.viewAll)
        this.get('/:name', this.view)
        this.post('/:name', this.save)

        this.delete('/:name', this.remove)
    }

    async viewAll(ctx) {
        const consumer = new Consumer(ctx.username)
        ctx.body = await consumer.viewTargetSystems()
    }

    async view(ctx) {
        const consumer = new Consumer(ctx.username)
        const { name } = ctx.params
        ctx.body = await consumer.viewTargetSystem(name)
    }

    async save(ctx) {
        const consumer = new Consumer(ctx.username)
        const { name } = ctx.params
        const { metadata, spec } = ctx.request.body
        await consumer.save(new TargetSystem(name, metadata, spec))
        ctx.body = { ok: true }
    }

    async remove(ctx) {
        const consumer = new Consumer(ctx.username)
        const { name } = ctx.params
        await consumer.delete(new TargetSystem(name, {}, {}))
        ctx.body = true
    }
}
