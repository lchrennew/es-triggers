const omits = [ undefined, null ]
const primitiveTypes = [ 'String', 'Number', 'Boolean' ]
const nonObjectLikeTypes = [ ...primitiveTypes, 'Function', 'AsyncFunction', 'Promise', 'Generator', 'GeneratorFunction', 'RegExp', 'Reflect', ...omits ]
export const isObjectLike = obj => !isOmit(obj) && !nonObjectLikeTypes.includes(obj.constructor?.name)
const isOmit = obj => omits.includes(obj)

export const matches = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

export const ofType = (obj, type) => {
    if (obj instanceof Array)
        return obj?.map(item => ofType(item, type))
    else if (obj instanceof Object) {
        const { name, metadata, spec } = obj
        return new type(name, metadata, spec)
    } else return obj
}
