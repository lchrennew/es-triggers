import { Controller } from "koa-es-template";
import { get } from "../core/infrastructure/storage/index.js";
import Listener from "../core/domain/listener.js";
import ListenerRequested from "../core/domain/events/listener-requested.js";
import ListenerInternalError from "../core/domain/events/listener-internal-error.js";
import ListenerNotFound from "../core/domain/events/listener-not-found.js";

export default class Hook extends Controller {

    constructor(config) {
        super(config);

        this.all('/:name', this.invoke)
    }

    async invoke(ctx) {
        const { name } = ctx.params

        const body = ctx.request.body
        const { headers, method, query } = ctx.request

        const context = { listener: name, method, query, headers, body }
        const eventID = this.onRequestIn(context);
        this.invokeListener(name, { ...context, eventID }).catch(() => false);
        ctx.body = { ok: true, eventID }
    }

    async invokeListener(name, context) {
        const listener = await get(Listener, name).catch(this.onListenerNotFound(context))
        listener?.invoke(context).catch(this.onListenerInternalError(context))
    }

    onRequestIn(context) {
        const listenerRequested = new ListenerRequested(context)
        listenerRequested.flush()
        return listenerRequested.eventID
    }

    onListenerInternalError(context) {
        return error => {
            const listenerError = new ListenerInternalError(context, error)
            listenerError.flush()
        };
    }

    onListenerNotFound(context) {
        return error => {
            const listenerNotFound = new ListenerNotFound(context, error)
            listenerNotFound.flush()
        };
    }
}
