import { Database } from "./database/database.ts";
import { MigrationDirectory } from "./migration-directory/migration-directory.ts";
import { Migrator } from "./migrator/migrator.ts";

import { deps as external } from "./deps.ts";


export const deps = {
  ...external,
  MigrationDirectory,
  Migrator,
  Database,
};

type DatabaseConfig = {
  database: string;
  hostname: string;
  port: string;
  user: string;
  password: string;
};

type MigrateConfig = DatabaseConfig & {
  path: string;
};

export const api = {
  async initialize(config: DatabaseConfig) {
    const client = new deps.postgres.Client(config);
    const db = new deps.Database(client);
    await db.initialize();
  },

  async version(config: MigrateConfig) {
    const client = new deps.postgres.Client(config);
    const db = new deps.Database(client);
    const dbVersion = await db.fetchVersion();
    const path = config.path;
    const directory = new deps.MigrationDirectory(path);
    await directory.scan();
    return { db: dbVersion, latest: directory.latestVersion };
  },

  async up(config: MigrateConfig) {
    const client = new deps.postgres.Client(config);
    const db = new deps.Database(client);
    const databaseVersion = await db.fetchVersion();

    const directory = new deps.MigrationDirectory(config.path);
    await directory.scan();
    const migrations = await directory.load(databaseVersion);

    const migrator = new deps.Migrator(migrations);
    await migrator.migrate(client);
  },
};
