import { get, getAll, remove, removeByName, save } from "../infrastructure/storage/index.js";
import { DomainModel } from "./domain-model.js";

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
     * @return {Promise<*>}
     */
    async delete(domainModel) {
        return await remove(domainModel, this.username)
    }

    async deleteByName(type, name) {
        return await removeByName(type.kind, name, this.username)
    }

    async viewAll(type) {
        return await getAll(type)
    }

    async view(type, name) {
        return await get(type, name)
    }
}
