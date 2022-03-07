import * as defaultStorage from "../infrastructure/storage/index.js";
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
    save(domainModel, storage = defaultStorage) {
        logger.info(`consumer ${this.username} saved ${domainModel}.`)
        return storage.save(domainModel, this.username)
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @param storage
     * @return {Promise<*>}
     */
    delete(domainModel, storage = defaultStorage) {
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
    deleteByName(type, name, storage = defaultStorage) {
        logger.info(`consumer ${this.username} saved ${type.kind} ${name}.`)
        return storage.removeByName(type.kind, name, this.username)
    }

    /**
     *
     * @param type
     * @param storage
     * @return {Promise<*[]>}
     */
    viewAll(type, storage = defaultStorage) {
        return storage.getAll(type)
    }

    /**
     *
     * @param type
     * @param name
     * @param storage
     * @return {Promise<*>}
     */
    view(type, name, storage = defaultStorage) {
        return storage.get(type, name)
    }
}
