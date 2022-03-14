import * as defaultStorage from "../infrastructure/storage/index.js";
import Trigger from "./trigger.js";

export default class Client {
    name

    constructor(name) {
        this.name = name;
    }

    async getTriggers(storage = defaultStorage, cache = defaultStorage) {
        return storage.getAll(Trigger, name, storage, cache)
    }
}
