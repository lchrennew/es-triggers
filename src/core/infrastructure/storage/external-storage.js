import { load } from "../presentation/index.js";

export default class ExternalStorage{
    gets(type, ...files) {
        return files.map(content => load(content, type))
    }
}
