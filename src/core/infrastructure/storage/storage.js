import { format } from "../presentation/index.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('Storage')

export default class Storage {

    getModelPath(domainModel) {
        return this.getPath(domainModel.kind, `${domainModel.name}.${format}`)
    }

    getPath(kind, path = '') {
        return `${kind}/${path}`;
    }

    /**
     *
     * @param domainModel {DomainModel}
     * @param operator {string}
     * @return {Promise<void>}
     */
    save(domainModel, operator) {
    }

    remove(path, operator) {
    }

    /**
     *
     * @param type
     * @param name
     * @return {Promise<*>}
     */
    get(type, name) {
        logger.debug('get::args', type, name)
        return this.getByPath(this.getPath(type.kind, name), type)
    }

    /**
     * 获取路径下的所有对象
     * @param type
     * @param path
     * @return {Promise<void>}
     */
    async getsByPath(type, path) {
    }

    async getPathsByPath(type, path) {

    }

    async getByPath(path, type) {

    }
}
