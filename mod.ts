import { Database } from "./database/database.ts";
import { MigrationDirectory } from "./migration-directory/migration-directory.ts";
import { Migrator } from "./migrator/migrator.ts";

import { deps as external } from "./deps.ts";
import { ConnectionParamsError } from "https://deno.land/x/postgres@v0.17.0/client/error.ts";
import { PostgresError } from "https://deno.land/x/postgres@v0.17.0/mod.ts";


export const deps =  {
  ...external,
  MigrationDirectory,
  Migrator,
  Database,
};


export function help() {
  deps.console.log("migrate your life");
}


async function connect() {
  const config = {
    database: deps.env.get("MIGRATE_DATABASE") ?? "postgres",
    hostname: deps.env.get("MIGRATE_DATABASE_HOST") ?? "localhost",
    port: deps.env.get("MIGRATE_DATABASE_PORT") ?? "5432",
    user: deps.env.get("MIGRATE_DATABASE_USER") ?? "postgres",
    password: deps.env.get("MIGRATE_DATABASE_PASSWORD") ?? "",
  };

  if (config.password == "") {
    config.password = await deps.prompt.password("Password: ");
  }

  deps.console.log(`Connecting to ${config.database} at ${config.hostname}:${config.port} with user ${config.user}...`);

  return { config, client: new deps.postgres.Client(config) };
}


async function initialize() {
  const flags = deps.parseArgs(deps.args, {
    boolean: ["help"],
  });

  if (flags.help) {
    deps.console.log("migrate your aesthetic");
    return;
  }

  const { config, client } = await connect();
  const db = new deps.Database(client);

  deps.console.log(`Initializing database ${config.database}...`);
  await db.initialize();
}


async function version() {
  const flags = deps.parseArgs(deps.args, {
    string: ["path"],
  });

  const { client } = await connect();
  const db = new deps.Database(client);
  try {
    const dbVersion = await db.fetchVersion();
    deps.console.log(`Database version: ${dbVersion}`);
  } catch (e) {
    if (e instanceof ConnectionParamsError) {
      deps.console.error(`Error connecting to database: "${e.message}".`);
      deps.exit(1);
    } else if (e instanceof PostgresError && e.fields.code === "28P01") {
      deps.console.error(`Authentication failed.`);
      deps.exit(1);
    } else if (e instanceof PostgresError && e.fields.code === "42P01") {
      deps.console.error(`Database has not been initialized. Please run "migrate initialize".`);
      deps.exit(1);
    } else {
      throw e;
    }
  }

  const path = flags.path ?? "./migrations";
  const directory = new deps.MigrationDirectory(path);
  try {
    await directory.scan();
  } catch (e) {
    if (e.name === "NotFound") {
      deps.console.error(`No "migrations" directory found.`);
      deps.exit(1);
    }
  }

  deps.console.log(`Latest version: ${directory.latestVersion}`);
}


async function up() {
  const flags = deps.parseArgs(deps.args, {
    boolean: ["help"],
    string: ["path"],
  });

  if (flags.help) {
    deps.console.log("migrate your aesthetic");
    return;
  }

  const path = flags.path ?? "./migrations";

  deps.console.log(`Loading database migrations from "${path}"...`);

  const directory = new deps.MigrationDirectory(path);
  await directory.scan();

  const { client } = await connect();

  const db = new deps.Database(client);

  const databaseVersion = await db.fetchVersion();

  const migrations = await directory.load(databaseVersion);

  const migrator = new deps.Migrator(migrations);
  await migrator.migrate(client);
}


export async function command() {
  switch (deps.args[0]) {
    case "initialize":
      await initialize();
      break;
    case "version":
      await version();
      break;
    case "up":
      await up();
      break;
    case "help":
    default:
      help();
  }
}
