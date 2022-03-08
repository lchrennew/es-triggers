import { Domain } from "../domains.js";
import Trigger from "../../core/domain/trigger.js";
import Consumer from "../../core/domain/consumer.js";
import Listener from "../../core/domain/listener.js";

export default class Triggers extends Domain(Trigger) {
    async viewAll(ctx) {
        await super.viewAll(ctx);
        const { listener, targetSystem } = ctx.query
        const triggers = ctx.body
        if (listener && targetSystem && triggers.length) {
            const consumer = new Consumer(ctx.username)
            const listenerInfo = await consumer.view(Listener, listener)
            ctx.body = triggers.filter(trigger => trigger.spec.targetSystem === targetSystem && !listenerInfo.spec.triggers.includes(trigger.name))
        }
    }
}
