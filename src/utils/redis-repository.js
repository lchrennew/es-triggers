import { deserialize, fromFlatEntries, serialize } from './objects.js';

export default class RedisRepository {
    #redis;

    constructor(redis) {
        this.#redis = redis;
    }

    async insert(key, data) {
        const dataKey = `{${data.constructor.name}}:${key}`
        const exists = await this.#redis.exists(dataKey)
        if (exists !== '0') return false
        await this.#redis.hset(dataKey, serialize(data))
        return true
    }

    /**
     *
     * @param key
     * @param data
     * @param options {{type: string}}
     * @return {Promise<void>}
     */
    async save(key, data, options) {
        const { prefix = '', type } = options ?? {}
        const dataKey = `{${type?.name ?? type ?? data.constructor.name}}:${key}`
        const serialized = serialize(data, prefix)
        if (Object.keys(serialized).length) await this.#redis.hset(dataKey, serialize(data, prefix))
    }

    async get(key, Type, prefix = '') {
        const dataKey = `{${Type.name ?? Type}}:${key}`
        if (prefix) return deserialize(fromFlatEntries((await this.#redis.hscan(dataKey, 0, 'match', `${prefix}*`))[1]), prefix)
        return deserialize(await this.#redis.hgetall(dataKey))
    }

    async gets(keys, Type) {
        return Promise.all(keys.map(key => this.get(key, Type)))
    }
}

export const repo = new RedisRepository()
