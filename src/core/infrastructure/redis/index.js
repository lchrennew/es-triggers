import { DomainModel } from "../../domain/domain-model.js";
import { redis } from "../../../utils/redis.js";

const filepath = domainModel => `{model}:${domainModel.kind}:${domainModel.name}`

/**
 *
 * @param domainModel {DomainModel}
 * @param operator {string}
 * @return {Promise<void>}
 */
export const save = domainModel =>
    redis.set(filepath(domainModel), domainModel.json)

export const remove = domainModel => redis.unlink(filepath(domainModel))


export const get = async (type, name) => {
    const json = await redis.get(filepath({ kind: type.kind, name }))
    return DomainModel.fromJson(json, type)
}

const gets = (type, ...files) => files.map(json => DomainModel.fromYaml(json, type))

export const getAll = async (type, path) => {
    const files = await scanAll(`{model}:${type.kind}:${path}*`)
    return gets(type, ...files)
}

export const getAllByNames = async (type, ...names) => {
    if (!names.length) return []
    const paths = names.map(name => filepath({ kind: type.kind, name }))
    const files = await redis.mget(...paths)
    return gets(type, ...files)
}

const scanAll = async ({ match, count }) => {
    let cursor = '0'
    const result = []
    do {
        const [ nextCursor, values ] = await redis.scan(cursor, ...(match ? [ 'MATCH', match ] : []), ...(count ? [ 'COUNT', count ] : []))
        cursor = nextCursor
        result.push(...values)
    } while (cursor !== '0')
    return result
}
