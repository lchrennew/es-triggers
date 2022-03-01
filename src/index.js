import { startServer } from "koa-es-template";
import Index from "./routes/index.js";
import { use } from "es-fetch-api";
import fetch from "node-fetch";

use(fetch)
await startServer({ index: Index })

