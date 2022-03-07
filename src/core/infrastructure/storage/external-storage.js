import { load } from "../presentation/index.js";
import Storage from "./storage.js";

export default class ExternalStorage extends Storage {
    gets(type, ...files) {
        return files.map(content => load(content, type))
    }
}
