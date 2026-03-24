import { Pool, QueryResultRow } from "pg";

declare global {
    var __pgPool: Pool | undefined;
}

function createPool() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL is not configured.");
    }

    return new Pool({
        connectionString,
        max: Number(process.env.PG_POOL_MAX ?? 20),
    });
}

function getPool() {
    if (!global.__pgPool) {
        global.__pgPool = createPool();
    }

    return global.__pgPool;
}

export async function query<T extends QueryResultRow>(
    text: string,
    params?: Array<string | number | boolean | null>
) {
    return getPool().query<T>(text, params);
}
