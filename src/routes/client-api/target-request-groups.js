import { Controller } from "koa-es-template";
import TargetRequestGroup from "../../core/domain/target-request-group.js";
import TargetRequest from "../../core/domain/target-request.js";
import { matches } from "../../utils/objects.js";
import { client } from "../../core/infrastructure/cac/client.js";

export default class TargetRequestGroups extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.delete('/', this.deleteGroup)
        this.put('/', this.saveGroup)
        this.get('/requests', this.getTargetRequests)
    }

    async saveGroup(ctx) {
        const { name } = ctx.query
        const targetRequests = ctx.request.body ?? []
        const group = await client.getOne(TargetRequestGroup.kind, name).catch(() => null)
        const newIndex = Object.fromEntries(targetRequests.map(r => [ r.name, r ]))

        const changeSet = {
            deleted: [],
            saved: [],
        }
        if (group) {
            const kind = TargetRequest.kind
            const existing = await client.getMultiple(group.spec.targetRequests.map(name => ({ kind, name })))
            const removed = existing.filter(r => !newIndex[r.name])
            const oldIndex = Object.fromEntries(existing.map(r => [ r.name, r ]))
            const modified = targetRequests.filter(r => !matches(r.spec, oldIndex[r.name]?.spec))

            for (const r of removed) {
                changeSet.deleted.push({ kind, name: r.name })
            }
            for (const r of modified) {
                changeSet.saved.push(new TargetRequest(r.name, r.metadata, r.spec))
            }
        } else {
            for (const r of targetRequests) {
                changeSet.saved.push(new TargetRequest(r.name, r.metadata, r.spec))
            }
        }

        const spec = { targetRequests: targetRequests.map(({ name }) => name) }

        if (!matches(group?.spec, spec)) {
            changeSet.saved.push(new TargetRequestGroup(name, {}, spec))
        }
        await client.submit(changeSet, ctx.state.username)
        ctx.body = { ok: true }
    }

    async getTargetRequests(ctx) {
        const { name } = ctx.query
        const group = await client.getOne(TargetRequestGroup, name).catch(() => null)

        if (!group) {
            ctx.body = []
            return
        }
        const kind = TargetRequest.kind
        ctx.body = await client.getMultiple(group.spec.targetRequests.map(name => ({ kind, name })))
    }

    async deleteGroup(ctx) {
        const { name } = ctx.query
        await client.delete(TargetRequestGroup.kind, name, ctx.state.username)
        ctx.body = { ok: true }
    }
}
