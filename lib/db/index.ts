import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __cfPool?: Pool;
  __cfDb?: Drizzle;
};

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL env var is required");
  }
  if (!globalForDb.__cfPool) {
    globalForDb.__cfPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    });
  }
  return globalForDb.__cfPool;
}

function getDb(): Drizzle {
  if (!globalForDb.__cfDb) {
    globalForDb.__cfDb = drizzle(getPool(), { schema, casing: "camelCase" });
  }
  return globalForDb.__cfDb;
}

export const db = new Proxy({} as Drizzle, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
export type DB = Drizzle;
