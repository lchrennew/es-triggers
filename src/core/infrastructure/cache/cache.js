import { getLogger } from "koa-es-template";

export default class Cache {
    logger = getLogger(`Cache: ${this.constructor.name}`)
    #cache = {}

    async get(path, type) {
        return this.#cache[path];
    }

    async set(path, content) {
        this.#cache[path] = content
        return content
    }

    async getOrSet(path, fallback) {
        return await this.get(path) ?? await this.set(path, await fallback(path));
    }

    async getsByPaths(paths, fallback) {
        const contents = []
        for (const path of paths) contents.push(await this.getOrSet(path, fallback))
        return contents
    }

    async getsInDir(dir, fallback) {
        const paths = Object.keys(this.#cache).filter(path => path.startsWith(dir))
        return await this.getsByPaths(paths, fallback)
    }

    remove(path) {
        return delete this.#cache[path];
    }

    async removeAll() {
        this.#cache = {}
    }

}
