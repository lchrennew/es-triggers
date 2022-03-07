import { getLogger } from "koa-es-template";

const logger = getLogger('Cache')
const implement = process.env.MODEL_CACHE ?? 'in-memory'
logger.debug(`Loading Cache Implement: ${implement}`)
const { Cache } = await import(`./${implement}/index.js`)

export { Cache }
