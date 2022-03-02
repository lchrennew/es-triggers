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

        const sourceRequest = { listener: name, method, query, headers, body }
        const eventID = this.onRequestIn(sourceRequest);
        this.invokeListener(name, { ...sourceRequest, eventID }).catch(() => false);
        ctx.body = { ok: true, eventID }
    }

    async invokeListener(name, sourceRequest) {
        const listener = await get(Listener, name).catch(this.onListenerNotFound(sourceRequest))
        listener?.invoke(sourceRequest).catch(this.onListenerInternalError(sourceRequest))
    }

    onRequestIn(sourceRequest) {
        const listenerRequested = new ListenerRequested(sourceRequest)
        listenerRequested.flush()
        return listenerRequested.eventID
    }

    onListenerInternalError(sourceRequest) {
        return error => {
            const listenerError = new ListenerInternalError(sourceRequest, error)
            listenerError.flush()
        };
    }

    onListenerNotFound(sourceRequest) {
        return error => {
            const listenerNotFound = new ListenerNotFound(sourceRequest, error)
            listenerNotFound.flush()
        };
    }
}
