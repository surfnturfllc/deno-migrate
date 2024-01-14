import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import * as prompt from "https://raw.githubusercontent.com/surfnturfllc/deno-cli/main/src/prompt.ts";

import { MigrationDirectory } from "./migration-directory.ts";
import { Migrator } from "./migrator.ts";
import { Database } from "./database.ts";


export const _deps = {
  console: {
    log: console.log,
  },
  env: {
    get: Deno.env.get,
  },
  prompt: {
    password: prompt.password,
  },
  postgres: {
    Client: postgres.Client,
  },
  MigrationDirectory,
  Migrator,
  Database,
};


export async function migrate(client: Client, migrations: Migration[]) {
  const migrator = new _deps.Migrator(migrations);
  await migrator.migrate(client);
}


export async function command(path = "./schema") {
  const DATABASE_NAME = _deps.env.get("MIGRATE_DATABASE") ?? "postgres";
  const DATABASE_HOST = _deps.env.get("MIGRATE_DATABASE_HOST") ?? "localhost";
  const DATABASE_PORT = _deps.env.get("MIGRATE_DATABASE_PORT") ?? "5432";
  const DATABASE_USER = _deps.env.get("MIGRATE_DATABASE_USER") ?? "postgres";

  _deps.console.log(`Connecting to ${DATABASE_NAME} at ${DATABASE_HOST}:${DATABASE_PORT} with user ${DATABASE_USER}...`);
  const DATABASE_PASSWORD = await _deps.prompt.password(`Password: `);

  const client = new _deps.postgres.Client({
    database: DATABASE_NAME,
    hostname: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  });

  const db = new _deps.Database();
  const databaseVersion = await db.fetchVersion(client);

  _deps.console.log(`Loading database migrations from "${path}"...`);

  const directory = new _deps.MigrationDirectory(path);
  await directory.scan();

  return migrate(client, await directory.load(databaseVersion));
}


if (import.meta.main) {
  await command();
}
