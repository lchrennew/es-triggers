import { redis } from "../../../../utils/redis.js";
import { dump, load } from "../../presentation/index.js";
import ExternalStorage from "../external-storage.js";

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

    async get(type, name) {
        const content = await redis.get(this.getPath(type.kind, name))
        return load(content, type)
    }

    async getByPath(type, path) {
        const files = await this.scanAll({ match: this.getPath(type.kind, `${path}*`) })
        return this.gets(type, ...files)
    }

    async getAllByNames(type, ...names) {
        if (!names.length) return []
        const paths = names.map(name => this.getPath(type.kind, name))
        const files = await redis.mget(...paths)
        return this.gets(type, ...files)
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
