import * as storage from "../infrastructure/storage/index.js";
import { DomainModel } from "./domain-model.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('consumer')

export default class Consumer {
    username;

    constructor(username) {
        this.username = username;
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @param storage
     * @return {Promise<void>}
     */
    save(domainModel) {
        logger.info(`consumer ${this.username} saved ${domainModel}.`)
        return storage.save(domainModel, this.username)
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @param storage
     * @return {Promise<*>}
     */
    delete(domainModel) {
        logger.info(`consumer ${this.username} delete ${domainModel}.`)
        return storage.remove(domainModel, this.username)
    }

    /**
     *
     * @param type
     * @param name
     * @param storage
     * @return {Promise<*>}
     */
    deleteByName(type, name) {
        logger.info(`consumer ${this.username} deleted file ${type.kind} ${name}.`)
        return storage.removeByName(type.kind, name, this.username)
    }

    /**
     *
     * @param type
     * @param path
     * @param storage
     * @return {Promise<*[]>}
     */
    viewAll(type, path) {
        return storage.getAll(type, path)
    }

    /**
     *
     * @param type
     * @param name
     * @param storage
     * @return {Promise<*>}
     */
    view(type, name) {
        return storage.get(type, name)
    }

    viewByNames(type, names = []) {
        return storage.getAllByNames(type, names)
    }
}
