import { exportName, importNamespace } from "../../utils/imports.js";
import BindingInternalError from "./events/binding-internal-error.js";
import { DomainModel } from "es-configuration-as-code-client";
import { getLogger } from "koa-es-template";
import BindingBound from "./events/binding-bound.js";
import BindingBinding from "./events/binding-binding.js";

const logger = getLogger('BINDING')
export default class Binding extends DomainModel {

    static kind = 'binding'

    constructor(name, metadata, { script }) {
        super(Binding.kind, name, metadata, { script });
    }

    async bind(context) {
        const bindingBinding = new BindingBinding(this, ...context.chain)
        bindingBinding.flush()
        context.binding = this.name
        context.chain = [ ...context.chain, bindingBinding.eventID ]

        try {

            const script = `async ({ listener, trigger, method, query, headers, body, eventID })=>\
        { const variables={}; ${this.spec.script}; return variables; }`
            const { bind } = await importNamespace(exportName('bind', script))
            const variables = await bind(context)
            context.variables = variables
            logger.debug('variables = ', variables)

            const bindingBound = new BindingBound(variables, ...context.chain)
            bindingBound.flush()

            return bindingBound
        } catch (error) {
            logger.error(error)
            const bindingInternalError = new BindingInternalError(error, ...context.chain)
            bindingInternalError.flush()
        }
    }
}
