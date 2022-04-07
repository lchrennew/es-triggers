import { Controller } from "koa-es-template";
import { client } from "../core/infrastructure/cac/client.js";


class Domains extends Controller {
    type
    client

    constructor(config, type) {
        super(config);
        this.type = type;
        this.get('/', this.viewAll)
        this.get('/:name', this.view)
        this.post('/:name', this.save)
        this.delete('/:name', this.remove)
        this.client = client
    }

    async viewAll(ctx) {
        const { path } = ctx.query
        ctx.body = await this.client.find(this.type.kind, path, true)
    }

    async view(ctx) {
        const { name } = ctx.params
        ctx.body = await this.client.getOne(this.type.kind, name,)
    }

    async save(ctx) {
        const { name } = ctx.params
        const { metadata, spec } = ctx.request.body
        const type = this.type
        await this.client.save({ kind: type.kind, name, metadata, spec }, ctx.state.username)
        ctx.body = { ok: true }
    }

    async remove(ctx) {
        const { name } = ctx.params
        ctx.body = await this.client.delete(this.type.kind, name, ctx.state.operator)
    }
}

export const Domain = T => class extends Domains {
    constructor(config) {
        super(config, T);
    }
}
