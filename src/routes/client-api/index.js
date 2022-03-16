import { Controller } from "koa-es-template";
import Triggers from "./triggers.js";
import TargetRequestGroups from "./target-request-groups.js";

export default class ClientApi extends Controller {

    constructor(config) {
        super(config);
        this.use('/target-request-groups', TargetRequestGroups)
        this.use('/triggers', Triggers)
    }
}
