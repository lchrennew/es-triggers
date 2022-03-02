import { Controller } from "koa-es-template";
import TargetSystems from "./target-systems.js";
import Listeners from "./listeners.js";

export default class AdminApi extends Controller {

    constructor(config) {
        super(config);
        this.use('/target-systems', TargetSystems)
        this.use('/listeners', Listeners)
    }
}
