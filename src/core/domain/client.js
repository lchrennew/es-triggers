import {defaultStorage, defaultCache} from "../infrastructure/storage/index.js";
import Trigger from "./trigger.js";

export default class Client {
    name

    constructor(name) {
        this.name = name;
    }

    async getTriggers(storage = defaultStorage, cache = defaultCache) {
        return storage.getAll(Trigger, this.name, storage, cache)
    }
}
