import { Cache } from "../cache/index.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('STORAGE')
const implement = process.env.MODEL_STORAGE ?? 'in-memory'

logger.debug(`Loading Storage Implement: ${implement}`)
const { Storage } = await import(`./${implement}/index.js`)

/**
 * @type {Cache}
 */
export const defaultCache = new Cache()

/**
 * @type {Storage}
 */
export const defaultStorage = new Storage()
/**
 *
 * @param domainModel {DomainModel}
 * @param operator {string}
 * @param storage
 * @param cache
 * @return {Promise<void>}
 */
export const save = async (domainModel, operator,
                           storage = defaultStorage, cache = defaultCache) => {
    const result = await storage.save(domainModel, operator)
    await cache.set(storage.getModelPath(domainModel), domainModel)
    return result
}

export const remove = async (domainModel, operator,
                             storage = defaultStorage, cache = defaultCache) => {
    const path = storage.getModelPath(domainModel)
    const result = await storage.remove(path, operator)
    cache.remove(path)
    return result
}
export const removeByName = async (kind, name, operator,
                                   storage = defaultStorage, cache = defaultCache) => {
    const path = storage.getModelPath({ kind, name })
    const result = await storage.remove(path, operator)
    cache.remove(path)
    return result
}

/**
 *
 * @param type
 * @param name
 * @param storage
 * @param cache
 * @return {Promise<*>}
 */
export const get = (type, name,
                    storage = defaultStorage, cache = defaultCache) => {
    const path = storage.getModelPath({ kind: type.kind, name })
    return cache.getOrSet(path, fallback(type, storage), type)
}

/**
 * 穿透缓存取单条数据
 * @param type
 * @param storage
 * @return {function(*): Promise<*>}
 */
const fallback = (type, storage = defaultStorage) => path => storage.getByPath(path, type)

/**
 *
 * @param type
 * @param path
 * @param storage
 * @param cache
 * @return {Promise<*[]>}
 */
export const getAll = async (type, path = '',
                             storage = defaultStorage, cache = defaultCache) => {
    const paths = await storage.getPathsByPath(type, path)
    logger.debug('get all', type.name, path, paths)
    return cache.getsByPaths(paths, fallback(type, storage), type)
}

/**
 *
 * @param type
 * @param names
 * @param storage
 * @param cache
 * @return {Promise<*[]>}
 */
export const getAllByNames = (type, names,
                              storage = defaultStorage, cache = defaultCache) => {
    const paths = names.map(name => storage.getModelPath({ kind: type.kind, name }))
    return cache.getsByPaths(paths, fallback(type, storage), type)
}

export const flushCache = (cache = defaultCache) => cache.removeAll()
