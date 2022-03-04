import { deleteFile, readAllDirectoryFiles, readFile, readFiles, saveFile } from "./api.js";
import { DomainModel } from "../../../domain/domain-model.js";
import { dump, format, load } from "../../presentation/index.js";
import { owner, repo } from './clients/index.js'

const filepath = domainModel => `${domainModel.kind}/${domainModel.name}.${format}`

/**
 *
 * @param domainModel {DomainModel}
 * @param operator {string}
 * @return {Promise<void>}
 */
export const save = (domainModel, operator) =>
    saveFile(owner, repo, filepath(domainModel), dump(domainModel), operator)

export const remove = (domainModel, operator) => deleteFile(owner, repo, filepath(domainModel), operator)

export const removeByName = (kind, name, operator) => deleteFile(owner, repo, filepath({ kind, name }), operator)

export const get = async (type, name) => {
    const content = await readFile(owner, repo, filepath({ kind: type.kind, name }))
    return load(content, type)
}

const gets = (type, ...files) => files.map(content => load(content, type))

export const getAll = async (type, path) => {
    const files = await readAllDirectoryFiles(owner, repo, [ type.kind, path ].join('/'))
    return gets(type, ...files)
}

export const getAllByNames = async (type, ...names) => {
    const paths = names.map(name => filepath({ kind: type.kind, name }))
    const files = await readFiles(owner, repo, ...paths)
    return gets(type, ...files)
}
