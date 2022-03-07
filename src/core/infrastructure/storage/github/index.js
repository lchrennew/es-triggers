import { deleteFile, getTreeFilePaths, readFile, readFiles, readTreeFiles, saveFile } from "./api.js";
import { DomainModel } from "../../../domain/domain-model.js";
import { dump, load } from "../../presentation/index.js";
import { owner, repo } from './clients/index.js'
import ExternalStorage from "../external-storage.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('GithubStorage')

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

    async getsByPath(type, path) {
        const files = await readTreeFiles(owner, repo, [ type.kind, path ].join('/'))
        return this.gets(type, ...files)
    }

    getModelPath(domainModel) {
        return super.getModelPath(domainModel);
    }

    async getPathsByPath(type, path) {
        return getTreeFilePaths(owner, repo, [ type.kind, path ].join('/'))
    }

    async getByPath(path, type) {
        const content = await readFile(owner, repo, path)
        return load(content, type)
    }

    async getAll(type, path) {
        const files = await readTreeFiles(owner, repo, [ type.kind, path ].join('/'))
        return this.gets(type, ...files)
    }

    async getsByNames(type, ...names) {
        const paths = names.map(name => this.getModelPath({ kind: type.kind, name }))
        const files = await readFiles(owner, repo, ...paths)
        return this.gets(type, ...files)
    }
}

export { GitHubStorage as Storage }
