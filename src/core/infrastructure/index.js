import { deleteFile, readAllDirectoryFiles, readFile, readFiles, saveFile } from "./gitea/index.js";
import { DomainModel } from "../domain/domain-model.js";

const owner = process.env.GITEA_SHARED_OWNER
const repo = process.env.GITEA_SHARED_REPO
const filepath = domainModel => `${domainModel.kind}/${domainModel.name}.yaml`

/**
 *
 * @param domainModel {DomainModel}
 * @param operator {string}
 * @return {Promise<void>}
 */
export const save = (domainModel, operator) => {
    const content = domainModel.base64Yaml
    return saveFile(owner, repo, filepath(domainModel), content, operator)
}

export const remove = (domainModel, operator) => deleteFile(owner, repo, filepath(domainModel), operator)


export const get = async (type, name) => {
    const yaml = await readFile(owner, repo, filepath({ kind: type.kind, name }))
    return DomainModel.fromYaml(yaml, type)
}

const gets = (type, ...files) => files.map(yaml => DomainModel.fromYaml(yaml, type))

export const getAll = async (type, path) => {
    const files = await readAllDirectoryFiles(owner, repo, [ type.kind, path ].join('/'))
    return gets(type, ...files)
}

export const getAllByNames = async (type, ...names) => {
    const paths = names.map(name => filepath({ kind: type.kind, name }))
    const files = await readFiles(owner, repo, ...paths)
    return gets(type, ...files)
}
