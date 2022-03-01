import { isObjectLike } from "./objects.js";

export const traversal = (obj, callback) => {
    const queue = [ [ null, null, obj ] ]
    while (queue.length) traversalQueueNode(queue, callback)
}

const traversalQueueNode = (queue, callback) => {
    const [ parent, name, obj ] = queue.shift()
    callback?.(parent, name, obj)
    isObjectLike(obj) && queue.push(...Object.entries(obj).map(entry => [ obj, ...entry ]))
}
