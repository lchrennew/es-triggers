import { Controller } from "koa-es-template";
import { Domain } from "../domains.js";
import Listener from "../../core/domain/listener.js";
import { TargetSystem } from "../../core/domain/target-system.js";
import Template from "../../core/domain/template.js";
import Binding from "../../core/domain/binding.js";
import SourceInterceptor from "../../core/domain/source-interceptor.js";
import TargetInterceptor from "../../core/domain/target-interceptor.js";
import { format } from "../../core/infrastructure/presentation/index.js";
import Triggers from "./triggers.js";

export default class AdminApi extends Controller {

    constructor(config) {
        super(config);
        this.use('/target-systems', Domain(TargetSystem))
        this.use('/listeners', Domain(Listener))
        this.use('/triggers', Triggers)
        this.use('/templates', Domain(Template))
        this.use('/bindings', Domain(Binding))
        this.use('/source-interceptors', Domain(SourceInterceptor))
        this.use('/target-interceptors', Domain(TargetInterceptor))

        this.get('/config', async ctx => ctx.body = { format })
    }
}
