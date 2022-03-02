import { Controller } from "koa-es-template";
import Hook from "./hook.js";
import AdminApi from "./admin-api/index.js";

export default class Index extends Controller {

    constructor(config) {
        super(config);

        this.use('/hook', Hook)
        this.use('/admin-api', AdminApi)
    }
}
