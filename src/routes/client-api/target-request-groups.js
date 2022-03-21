import { Controller } from "koa-es-template";
import Consumer from "../../core/domain/consumer.js";
import TargetRequestGroup from "../../core/domain/target-request-group.js";
import TargetRequest from "../../core/domain/target-request.js";
import { matches } from "../../utils/objects.js";

export default class TargetRequestGroups extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.delete('/', this.deleteGroup)
        this.put('/', this.saveGroup)
        this.get('/requests', this.getTargetRequests)
    }

    async saveGroup(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.query
        const targetRequests = ctx.request.body ?? []
        const group = await consumer.view(TargetRequestGroup, name).catch(() => null)
        const newIndex = Object.fromEntries(targetRequests.map(r => [r.name, r]))
        if (group) {
            const existing = await consumer.viewByNames(TargetRequest, group.spec.targetRequests)
            const removed = existing.filter(r => !newIndex[r.name])
            const oldIndex = Object.fromEntries(existing.map(r => [r.name, r]))
            const modified = targetRequests.filter(r => !matches(r.spec, oldIndex[r.name]?.spec))

            for (const r of removed) {
                await consumer.deleteByName(TargetRequest, r.name)
            }
            for (const r of modified) {
                await consumer.save(new TargetRequest(r.name, r.metadata, r.spec))
            }
        } else {
            for (const r of targetRequests) {
                await consumer.save(new TargetRequest(r.name, r.metadata, r.spec))
            }
        }

        const spec = { targetRequests: targetRequests.map(({ name }) => name) }

        if (!matches(group?.spec, spec))
            await consumer.save(new TargetRequestGroup(name, {}, spec))
        ctx.body = { ok: true }
    }

    async getTargetRequests(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.query
        const group = await consumer.view(TargetRequestGroup, name).catch(() => null)

        if (!group) {
            ctx.body = []
            return
        }
        ctx.body = await consumer.viewByNames(TargetRequest, group.spec.targetRequests)

    }

    async deleteGroup(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.query
        await consumer.deleteByName(TargetRequestGroup.kind, name)
        ctx.body = { ok: true }
    }
}
