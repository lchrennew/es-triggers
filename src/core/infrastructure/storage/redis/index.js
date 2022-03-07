import { redis } from "../../../../utils/redis.js";
import { dump, load } from "../../presentation/index.js";
import ExternalStorage from "../external-storage.js";
import { getLogger } from "koa-es-template";

const logger = getLogger('RedisStorage')

class RedisStorage extends ExternalStorage {

    getModelPath(domainModel) {
        return this.getPath(domainModel.kind, domainModel.name)
    }

    getPath(kind, path = '') {
        return `{model:${kind}}:${path}`
    }

    save(domainModel) {
        return redis.set(this.getModelPath(domainModel), dump(domainModel))
    }

    remove(path) {
        return redis.unlink(path)
    }

    async getByPath(path, type) {
        const content = await redis.get(path)
        return content ? load(content, type) : null
    }

    async getsByPath(type, path) {
        const files = await this.scanAll({ match: this.getPath(type.kind, `${path}*`) })
        return this.gets(type, ...files)
    }

    async getPathsByPath(type, path) {
        const pattern = `${this.getPath(type.kind, path)}*`
        return await redis.keys(pattern)
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

export { RedisStorage as Storage }
