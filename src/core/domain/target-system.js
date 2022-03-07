import { DomainModel } from "./domain-model.js";
import { exec } from "../../utils/strings.js";

export class TargetSystem extends DomainModel {
    static kind = 'target-system'

    constructor(name, { title }, { url }) {
        super(TargetSystem.kind, name, { title }, { url });
    }

    getUrl(variables) {
        return exec(this.spec.url, variables)
    }
}
