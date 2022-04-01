import { Controller } from "koa-es-template";
import Hook from "./hook.js";
import AdminApi from "./admin-api/index.js";
import ClientApi from "./client-api/index.js";
import { flushCache } from "../core/infrastructure/storage/index.js";

export default class Index extends Controller {

    constructor(config) {
        super(config);

        this.use('/hook', Hook)
        this.use('/flush', this.flush)
        this.use('/admin-api', AdminApi)
        this.use('/client-api', ClientApi)
    }

    async flush() {
        await flushCache()
    }
}
