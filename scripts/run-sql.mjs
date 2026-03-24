import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const fileArg = process.argv[2];

if (!fileArg) {
    console.error("Usage: node scripts/run-sql.mjs <sql-file-path>");
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not configured.");
    process.exit(1);
}

const sqlPath = resolve(process.cwd(), fileArg);
const sql = await readFile(sqlPath, "utf8");

const client = new Client({ connectionString });

try {
    await client.connect();
    await client.query(sql);
    console.log(`Executed: ${fileArg}`);
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await client.end();
}
