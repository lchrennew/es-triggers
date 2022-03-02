import { DomainModel } from "../../../domain/domain-model.js";
import { redis } from "../../../../utils/redis.js";
import { dump, load } from "../../presentation/index.js";

const filepath = domainModel => `{model}:${domainModel.kind}:${domainModel.name}`

/**
 *
 * @param domainModel {DomainModel}
 * @return {Promise<void>}
 */
export const save = domainModel => redis.set(filepath(domainModel), dump(domainModel))

export const remove = domainModel => redis.unlink(filepath(domainModel))

export const removeByName = (kind, name) => redis.unlink(filepath({ kind, name }))

export const get = async (type, name) => {
    const content = await redis.get(filepath({ kind: type.kind, name }))
    return load(content, type)
}

const gets = (type, ...files) => files.map(content => load(content, type))

export const getAll = async (type, path) => {
    const files = await scanAll({ match: `{model}:${type.kind}:${path}*` })
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
