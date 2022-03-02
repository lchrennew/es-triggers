import { get, getAll, remove, save } from "../infrastructure/storage/index.js";
import { DomainModel } from "./domain-model.js";
import { TargetSystem } from "./target-system.js";

export default class Consumer {
    username;

    constructor(username) {
        this.username = username;
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @return {Promise<void>}
     */
    async save(domainModel) {
        await save(domainModel, this.username)
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @return {Promise<void>}
     */
    async delete(domainModel) {
        await remove(domainModel, this.username)
    }

    async viewTargetSystems() {
        return await getAll(TargetSystem.kind)
    }

    async viewTargetSystem(name) {
        return await get(TargetSystem.kind, name)
    }


}
