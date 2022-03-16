import { DomainModel } from "./domain-model.js";

export default class TargetRequestGroup extends DomainModel {
    static kind = 'target-request-group'

    constructor(name, metadata, { targetRequests = [] }) {
        super(TargetRequestGroup.kind, name, metadata, { targetRequests });
    }
}
