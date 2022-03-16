import { Controller } from "koa-es-template";
import Consumer from "../../core/domain/consumer.js";
import TargetRequestGroup from "../../core/domain/target-request-group.js";
import TargetRequest from "../../core/domain/target-request.js";
import { matches } from "../../utils/objects.js";

export default class TargetRequestGroups extends Controller {

    constructor(config, ...middlewares) {
        super(config, ...middlewares);
        this.get('/:name', this.getGroup)
        this.put('/:name', this.saveGroup)
        this.get('/:name/requests', this.getTargetRequests)
    }

    async getGroup(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        ctx.body = await consumer.viewAll(TargetRequestGroup, name)
    }

    async saveGroup(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        const { targetRequests = [] } = ctx.request.body
        const group = await consumer.view(TargetRequestGroup, name)
        const newIndex = Object.fromEntries(targetRequests.map(r => [ r.name, r ]))
        if (group) {
            const existing = await consumer.viewByNames(TargetRequest, group.spec.targetRequests)
            const removed = existing.filter(r => !newIndex[r.name])
            const oldIndex = Object.fromEntries(existing.map(r => [ r.name, r ]))
            const modified = targetRequests.filter(r => !matches(r.spec, oldIndex[r.name]?.spec))

            await Promise.all(
                [
                    ...removed.map(r => consumer.deleteByName(TargetRequest, r.name)),
                    ...modified.map(r => consumer.save(new TargetRequest(r.name, r.metadata, r.spec))),
                ]
            )
        } else {
            await Promise.all(targetRequests.map(r => consumer.save(new TargetRequest(r.name, r.metadata, r.spec))))
        }

        await consumer.save(new TargetRequestGroup(name, { targetRequests: targetRequests.map(({ name }) => name) }))
        ctx.body = { ok: true }
    }

    async getTargetRequests(ctx) {
        const consumer = new Consumer(ctx.state.username)
        const { name } = ctx.params
        const group = await consumer.view(TargetRequestGroup, name)

        if (!group) {
            ctx.status = 404
            ctx.body = { ok: false }
        }
        ctx.body = await consumer.viewByNames(TargetRequest, group.specs.targetRequests)

    }
}
