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

    toString() {
        return `${this.kind} ${this.name}`
    }
}
