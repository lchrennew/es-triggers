import { Client } from "es-configuration-as-code-client";

export const client = new Client(process.env.CAC_API)
