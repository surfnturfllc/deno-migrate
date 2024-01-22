import { MigrationDirectory } from "./migration-directory/migration-directory.ts";
import { Migrator } from "./migrator/migrator.ts";
import { Database } from "./database/database.ts";

import { deps as external } from "./deps.ts";


export const deps =  {
  ...external,
  MigrationDirectory,
  Migrator,
  Database,
};


export async function migrate(client: Client, migrations: Migration[]) {
  const migrator = new deps.Migrator(migrations);
  await migrator.migrate(client);
}


export async function command(path = "./schema") {
  const DATABASE_NAME = deps.env.get("MIGRATE_DATABASE") ?? "postgres";
  const DATABASE_HOST = deps.env.get("MIGRATE_DATABASE_HOST") ?? "localhost";
  const DATABASE_PORT = deps.env.get("MIGRATE_DATABASE_PORT") ?? "5432";
  const DATABASE_USER = deps.env.get("MIGRATE_DATABASE_USER") ?? "postgres";

  deps.console.log(`Connecting to ${DATABASE_NAME} at ${DATABASE_HOST}:${DATABASE_PORT} with user ${DATABASE_USER}...`);
  const DATABASE_PASSWORD = await deps.prompt.password("Password: ");

  const client = new deps.postgres.Client({
    database: DATABASE_NAME,
    hostname: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  });

  const db = new deps.Database();
  const databaseVersion = await db.fetchVersion(client);

  deps.console.log(`Loading database migrations from "${path}"...`);

  const directory = new deps.MigrationDirectory(path);
  await directory.scan();

  return migrate(client, await directory.load(databaseVersion));
}
