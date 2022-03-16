const omits = [ undefined, null ]
const primitiveTypes = [ 'String', 'Number', 'Boolean' ]
const nonObjectLikeTypes = [ ...primitiveTypes, 'Function', 'AsyncFunction', 'Promise', 'Generator', 'GeneratorFunction', 'RegExp', 'Reflect', ...omits ]
export const isPrimitive = obj => !isOmit(obj) && primitiveTypes.includes(obj.constructor?.name)
export const isObjectLike = obj => !isOmit(obj) && !nonObjectLikeTypes.includes(obj.constructor?.name)
const isUnserializable = obj => isOmit(obj) || !isPrimitive(obj) && !isObjectLike(obj)
const isOmit = obj => omits.includes(obj)

const serializeKey = key => key.replaceAll(/[.\\]/g, '\\$&')
const deserializeKey = key => key.split(/(?<!\\)\./g).map(x => x.replaceAll(/\\([\\.])/g, '$1'))
const serializeValue = value => isPrimitive(value) ? `${value.constructor.name[0]}:${value}` : (Array.isArray(value) ? 'A' : 'O')
const deserializerFunctions = {
    A: () => [],
    O: () => ({}),
    B: v => v === 'true',
    N: v => Number(v),
    S: v => v,
}
export const deserializeValue = value => {
    const type = value?.[0]
    const val = value?.substring(2)
    return deserializerFunctions[type]?.(val)
}

function serializeQueueNode(queue, ignores, prefix, origin, result) {
    const [ key, value ] = queue.shift()
    if (isUnserializable(value)) return;
    if (ignores.some(ignore => key.match(ignore))) return;
    const k = [ prefix ? `${prefix}.${key}` : key ]
    const v = serializeValue(value)
    if (origin[k] !== v) {
        result[k] = v
    }
    if (isObjectLike(value)) {
        queue.push(...Object.entries(value).map(entry => [ `${key}.${serializeKey(entry[0])}`, entry[1] ]))
    }
}

const serializeObjectLike = (obj, ignores, prefix) => {
    if (isObjectLike(obj)) {
        const origin = obj?.getOrigin?.() ?? {}
        const result = {}
        const queue = Object.entries(obj).map(([ key, value ]) => [ serializeKey(key), value ])

        while (queue.length) serializeQueueNode(queue, ignores, prefix, origin, result)
        if (prefix) result[prefix] = serializeValue(obj)
        return result
    }
}

export const serialize = (obj, prefix) => {
    const ignores = obj.getSerializeIgnores?.() ?? []
    const result = serializeObjectLike(obj, ignores, prefix)
    if (!result) throw '无法序列化对象'
    return result
}

export const deserialize = (obj, prefix = '') => {
    if (isObjectLike(obj)) {
        const result = {}
        result.getOrigin = () => obj
        const entries = Object.entries(obj).sort(([ a ], [ b ]) => a > b ? 1 : -1)
        const prefixLength = prefix ? prefix.length + 1 : 0
        entries
            .forEach(([ key, value ]) => {
                if (prefix && !key.startsWith(`${prefix}.`)) return
                const path = deserializeKey(key.substr(prefixLength))
                let node = result
                while (path.length > 1) {
                    node = node[path.shift()]
                }
                node[path[0]] = deserializeValue(value)
            })
        return result
    } else return undefined
}

export const fromFlatEntries = (...args) => {
    if (args[0] instanceof Array)
        args = args[0]
    const obj = {}
    while (args.length) {
        const key = args.shift()
        obj[key] = args.shift() || key
    }
    return obj
}

export const valuesFromFlatEntries = (...args) => {
    if (args[0] instanceof Array)
        args = args[0]
    return [ ...new Set(args.filter((arg, i) => i & 1)) ]
}

export const matches = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)
