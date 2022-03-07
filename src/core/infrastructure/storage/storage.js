import { format } from "../presentation/index.js";

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

    async get(type, name) {
    }

    async getByPath(type, path) {
    }

    async getAllByNames(type, ...names) {
    }

}
