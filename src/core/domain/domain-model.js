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

    get json() {
        return JSON.stringify(this)
    }

    get yaml() {
        return dump(this)
    }

    get base64Yaml() {
        return encodeBase64(this.yaml)
    }

    /**
     *
     * @param base64Yaml {string}
     * @param type {Function}
     * @return {*}
     */
    static fromBase64Yaml(base64Yaml, type) {
        return this.fromYaml(decodeBase64(base64Yaml), type)
    }

    static fromYaml(yaml, type) {
        const { name, metadata, spec } = load(yaml)
        return new type(name, metadata, spec)
    }
}
