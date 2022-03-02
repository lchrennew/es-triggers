import { dump, load } from "js-yaml";
import { decodeBase64, encodeBase64 } from "../../utils/encode.js";

export class DomainModel {
    kind
    name
    metadata = {};
    spec = {}

    constructor(kind, name, metadata, spec) {
        this.metadata = metadata;
        this.kind = kind;
        this.name = name;
        this.spec = spec;
    }

    static fromYaml(yaml, type) {
        const { name, metadata, spec } = load(yaml)
        return new type(name, metadata, spec)
    }
}
