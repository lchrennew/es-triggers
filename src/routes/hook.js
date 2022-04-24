import { Controller } from "koa-es-template";
import Listener from "../core/domain/listener.js";
import ListenerNotFound from "../core/domain/events/listener-not-found.js";
import { client } from "../core/infrastructure/cac/client.js";
import { ofType } from "../utils/objects.js";
import RequestReceived from "../core/domain/events/request-received.js";
import ListenerInvoked from "../core/domain/events/listener-invoked.js";

export default class Hook extends Controller {

    constructor(config) {
        super(config);

        this.all('/:name', this.invoke)
    }

    async invoke(ctx) {
        const { name } = ctx.params

        const body = ctx.request.body
        const { headers, method, query } = ctx.request

        const requestReceived = new RequestReceived(ctx)
        requestReceived.flush()
        const { eventID } = requestReceived

        /**
         *
         * @type {Listener}
         */
        const listener = ofType(
            await client.getOne(Listener.kind, name)
                .catch(error => {
                    this.logger.error(error)
                    const listenerNotFound = new ListenerNotFound(name, error, eventID)
                    listenerNotFound.flush()
                }),
            Listener
        )
        const context = { listener: name, method, query, headers, body, eventID, chain: [ eventID ] }
        await listener.invoke(context)
        ctx.body = {
            ok: !!listener,
            eventID,
        }
    }

    async invokeListener(name, context) {
        const listener = ofType(
            await client.getOne(Listener.kind, name)
                .catch(error => {
                    this.logger.error(error)
                    const listenerNotFound = new ListenerNotFound(name, error, ...context.chain)
                    listenerNotFound.flush()
                }),
            Listener
        )
        if (listener) {
            const listenerInvoked = new ListenerInvoked(listener, ...context.chain)
            listenerInvoked.flush()
            await listener.invoke({ ...context, chain: [ ...context.chain, listenerInvoked.eventID ] })
        }
    }
}
