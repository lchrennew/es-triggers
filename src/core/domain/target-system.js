import { DomainModel } from "./domain-model.js";
import { exec } from "../../utils/strings.js";

export class TargetSystem extends DomainModel {
    static kind = 'target-system'

    constructor(name, { title }, { url }) {
        super(TargetSystem.kind, name, { title }, { url });
    }

    async getUrl(bindings) {
        return exec(this.spec.url, bindings)
    }
}
