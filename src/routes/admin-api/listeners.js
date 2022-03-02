import { Controller } from "koa-es-template";
import Consumer from "../../core/domain/consumer.js";

export default class Listeners extends Controller {
    constructor(config) {
        super(config);
        this.get('/', this.viewAll)
        this.get('/:name', this.view)
        this.post('/:name', this.save)
        this.delete('/:name', this.remove)
    }

    async viewAll(ctx) {
        const consumer = new Consumer(ctx.username)
    }

    async view(ctx) {

    }

    async save(ctx) {

    }

    async remove(ctx) {

    }
}
