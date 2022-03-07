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
        return content ? load(content, type) : null
    }

    set(path, content) {
        if (!content) return
        const key = this.getKey(path)
        redis.set(key, dump(content));
        return content
    }

    async getOrSet(path, fallback, type) {
        return await this.get(path, type) ?? await this.set(path, await fallback(path));
    }

    async getsByPaths(paths, fallback, type) {
        const contents = []
        for (const path of paths) {
            contents.push(await this.getOrSet(path, fallback, type))
        }
        return contents
    }

    async getsInDir(dir, fallback, type) {
        const keys = await redis.keys(`${this.getKey(dir)}*`)
        const paths = keys.map(key => this.getPath(key))
        return await this.getsByPaths(paths, fallback, type)
    }

    remove(path) {
        const key = this.getKey(path)
        return redis.unlink(key)
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
