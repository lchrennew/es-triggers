import { Client } from "es-configuration-as-code-client";
import { use } from "es-fetch-api";
import fetch from "node-fetch";

use(fetch)
export const client = new Client(process.env.CAC_API)
