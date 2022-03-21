import {defaultStorage, defaultCache} from "../infrastructure/storage/index.js";
import Trigger from "./trigger.js";

export default class Client {
    targetSystem

    /**
     *
     * @param targetSystem {string} 目标系统名词
     */
    constructor(targetSystem) {
        this.targetSystem = targetSystem;
    }

    async getTriggers(storage = defaultStorage, cache = defaultCache) {
        return storage.getAll(Trigger, this.targetSystem, storage, cache)
    }
}
