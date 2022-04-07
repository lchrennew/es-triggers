import Trigger from "./trigger.js";
import { client } from "../infrastructure/cac/client.js";

export default class Client {
    targetSystem

    /**
     *
     * @param targetSystem {string} 目标系统名词
     */
    constructor(targetSystem) {
        this.targetSystem = targetSystem;
    }

    getTriggers() {
        return client.find(Trigger.kind, this.targetSystem)
    }
}
