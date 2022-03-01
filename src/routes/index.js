import { Controller } from "koa-es-template";
import Hook from "./hook.js";

export default class Index extends Controller {

    constructor(config) {
        super(config);

        this.use('/hook', new Hook(config))
    }
}
