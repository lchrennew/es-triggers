import { Controller } from "koa-es-template";
import { Domain } from "../domains.js";
import TargetRequest from "../../core/domain/target-request.js";
import Triggers from "./triggers.js";

export default class ClientApi extends Controller {

    constructor(config) {
        super(config);
        this.use('/target-requests', Domain(TargetRequest))
        this.use('/triggers', Triggers)
    }
}
