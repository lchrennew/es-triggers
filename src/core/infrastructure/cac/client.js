import { getApi } from "es-fetch-api";
import { query } from "es-fetch-api/middlewares/query.js";
import { DELETE, POST, PUT } from "es-fetch-api/middlewares/methods.js";
import { json } from "es-fetch-api/middlewares/body.js";

const api = getApi(process.env.CAC_API)
const getData = async (...args) => {
    const response = await api(...args)
    return await response.json()
}

class Client {
    getOne(kind, name, ref) {
        return getData('configs/info', query({ kind, name, ref }))
    }

    exists(kind, name) {
        return getData('configs/exists', query({ kind, name }))
    }

    /**
     *
     * @param kind
     * @param prefix
     * @param full {1 || undefined}
     * @return {Promise<*>}
     */
    find(kind, prefix, full = 1) {
        return getData('configs', query({ kind, prefix, full }))
    }

    save(config, operator) {
        return getData('configs', PUT, json({ ...config, operator }))
    }

    delete(kind, name, operator) {
        return getData(`configs`, DELETE, query({ kind, name }), json(operator))
    }


    /**
     *
     * @param list
     * @param full {1 || undefined}
     * @return {*[]|Promise<*>}
     */
    getMultiple(list, full = 1) {
        if (!list.length) return []
        return getData('configs/multiple', POST, json({ list, full }))
    }
}

export const client = new Client()
