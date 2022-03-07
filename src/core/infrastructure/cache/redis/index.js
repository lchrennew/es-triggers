import Cache from "../cache.js";
import { redis } from "../../../../utils/redis.js";
import { dump, load } from "../../presentation/index.js";

class RedisCache extends Cache {

    getKey(path) {
        return `{path}:${path}`
    }

    getPath(key) {
        return key.substring(7)
    }

    async get(path, type) {
        const key = this.getKey(path)
        const content = await redis.get(key)
        return load(content, type)
    }

    set(path, content) {
        const key = this.getKey(path)
        return redis.set(key, dump(content));
    }

    async getOrSet(path, fallback, type) {
        const key = this.getKey(path)
        return await this.get(key, type) ?? await this.set(key, await fallback(path));
    }

    async getsByPaths(paths, fallback, type) {
        const contents = []
        for (const path of paths) contents.push(await this.getOrSet(path, fallback, type))
        return contents
    }

    async getsInDir(dir, fallback, type) {
        const keys = await redis.keys(`${this.getKey(dir)}*`)
        const paths = keys.map(key => this.getPath(key))
        return await this.getsByPaths(paths, fallback, type)
    }

    remove(path) {
        return delete this.#cache[path];
    }

    async scanAll({ match, count }) {
        let cursor = '0'
        const result = []
        do {
            const [ nextCursor, values ] = await redis.scan(cursor, ...(match ? [ 'MATCH', match ] : []), ...(count ? [ 'COUNT', count ] : []))
            cursor = nextCursor
            result.push(...values)
        } while (cursor !== '0')
        return result
    }
}

export { RedisCache as Cache }
