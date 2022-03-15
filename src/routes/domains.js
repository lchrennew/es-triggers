import { Controller } from "koa-es-template";
import Consumer from "../core/domain/consumer.js";

class Domains extends Controller {
    type

    constructor(config, type) {
        super(config);
        this.type = type;
        this.get('/', this.viewAll)
        this.get('/:name', this.view)
        this.post('/:name', this.save)
        this.delete('/:name', this.remove)
    }

    async viewAll(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { path } = ctx.query
        ctx.body = await consumer.viewAll(this.type, path)
    }

    async view(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        ctx.body = await consumer.view(this.type, name)
    }

    async save(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        const { metadata, spec } = ctx.request.body
        const type = this.type
        await consumer.save(new type(name, metadata, spec))
        ctx.body = { ok: true }
    }

    async remove(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        ctx.body = await consumer.deleteByName(this.type, name)
    }
}

export const Domain = T => class extends Domains {
    constructor(config) {
        super(config, T);
    }
}
