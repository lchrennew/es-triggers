import { exec } from "../../utils/strings.js";
import { traversal } from "../../utils/traversal.js";
import { DomainModel } from "es-configuration-as-code-client";

export default class Template extends DomainModel {
    static kind = 'template'

    constructor(name, { title }, { path, headers, body, query }) {
        super(Template.kind, name, { title }, { path, headers, body, query });
    }

    apply(bindings) {
        const spec = JSON.parse(JSON.stringify(this.spec))
        traversal(spec, (parent, key, value) => {
            if (parent && key && value?.constructor.name === 'String')
                parent[key] = exec(value, bindings)
        })
        return spec
    }
}
