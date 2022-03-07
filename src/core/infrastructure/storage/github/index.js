import { deleteFile, readFile, readFiles, readTreeFiles, saveFile } from "./api.js";
import { DomainModel } from "../../../domain/domain-model.js";
import { dump, load } from "../../presentation/index.js";
import { owner, repo } from './clients/index.js'
import ExternalStorage from "../external-storage.js";

class GitHubStorage extends ExternalStorage {

    /**
     *
     * @param domainModel {DomainModel}
     * @param operator {string}
     * @return {Promise<void>}
     */
    save(domainModel, operator) {
        return saveFile(owner, repo, this.getModelPath(domainModel), dump(domainModel), operator);
    }

    remove(path, operator) {
        return deleteFile(owner, repo, path, operator);
    }

    get(type, name) {
        return this.getByPath(type, this.getModelPath({ kind: type.kind, name }));
    }

    async getByPath(type, path) {
        const content = await readFile(owner, repo, path)
        return load(content, type)
    }

    async getAll(type, path) {
        const files = await readTreeFiles(owner, repo, [ type.kind, path ].join('/'))
        return this.gets(type, ...files)
    }

    async getAllByNames(type, ...names) {
        const paths = names.map(name => this.getModelPath({ kind: type.kind, name }))
        const files = await readFiles(owner, repo, ...paths)
        return this.gets(type, ...files)
    }
}

export { GitHubStorage as Storage }
