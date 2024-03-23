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


export function help() {
  deps.console.log(`
Usage:  migrate COMMAND [OPTIONS]

Manage your database schema with migrate.

Environment:
  Migrate's database connection must be configured using the following environment variables:

  MIGRATE_DATABASE
  The name of the database (Default: postgres)

  MIGRATE_DATABASE_HOST
  The network host address of the database server (Default: localhost)

  MIGRATE_DATABASE_PORT
  The port the database is listening for connections on (Default: 5432)

  MIGRATE_DATABASE_USER
  The name of the database user to connect as (Default: postgres)

  MIGRATE_DATABASE_PASSWORD
  The password of the database user to authenticate with. If this is not set the user will be prompted for a password on the command line


Subcommands:

  help        You're here! Display basic usage information
  initialize  Prepares the configured database for management
  version     Display version information about the current configured database and environment
  up          Run all migrations more recent than the database's version

Run "migrate COMMAND --help" for more information on a command.
`);
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
    deps.console.log(`
Usage:  migrate initialize [OPTIONS]

Initialize a database for management by migrate. This creates a table in the configured database called "migrations". This table will have a new entry inserted every time migrate updates the database. These entries are used to determine the database's current version as well as providing an audit-log of migrations.

Options:
  --help    Display usage information

Environment:
  Migrate's database connection must be configured using the following environment variables:

  MIGRATE_DATABASE
  The name of the database (Default: postgres)

  MIGRATE_DATABASE_HOST
  The network host address of the database server (Default: localhost)

  MIGRATE_DATABASE_PORT
  The port the database is listening for connections on (Default: 5432)

  MIGRATE_DATABASE_USER
  The name of the database user to connect as (Default: postgres)

  MIGRATE_DATABASE_PASSWORD
  The password of the database user to authenticate with. If this is not set, the user will be prompted for a password on the command line
`);
    return;
  }

  const { config, client } = await connect();
  const db = new deps.Database(client);

  deps.console.log(`Initializing database ${config.database}...`);
  await db.initialize();
}


async function version() {
  const flags = deps.parseArgs(deps.args, {
    boolean: ["help"],
    string: ["path"],
  });

  if (flags.help) {
    deps.console.log(`
Usage:  migrate version [OPTIONS]

Display the configured database's current version as well as the current version of the local project (if available)

Options:
  --help          Display usage information
  --path=<PATH>   Specify a file system path containing migration configuration

Environment:
  Migrate's database connection must be configured using the following environment variables:

  MIGRATE_DATABASE
  The name of the database (Default: postgres)

  MIGRATE_DATABASE_HOST
  The network host address of the database server (Default: localhost)

  MIGRATE_DATABASE_PORT
  The port the database is listening for connections on (Default: 5432)

  MIGRATE_DATABASE_USER
  The name of the database user to connect as (Default: postgres)

  MIGRATE_DATABASE_PASSWORD
  The password of the database user to authenticate with. If this is not set, the user will be prompted for a password on the command line
`);
    return;
  }

  const { client } = await connect();
  const db = new deps.Database(client);
  try {
    const dbVersion = await db.fetchVersion();
    deps.console.log(`Database version: ${dbVersion}`);
  } catch (e) {
    if (e instanceof deps.postgres.ConnectionParamsError) {
      deps.console.error(`Error connecting to database: "${e.message}".`);
      deps.exit(1);
    } else if (e instanceof deps.postgres.PostgresError && e.fields.code === "28P01") {
      deps.console.error(`Authentication failed.`);
      deps.exit(1);
    } else if (e instanceof deps.postgres.PostgresError && e.fields.code === "42P01") {
      deps.console.error(`Database has not been initialized. Please run "migrate initialize".`);
      deps.exit(1);
    } else {
      throw e;
    }
  }

  try {
    const path = flags.path ?? "./migrations";
    const directory = new deps.MigrationDirectory(path);
    await directory.scan();
  deps.console.log(`Latest version: ${directory.latestVersion}`);
  } catch (e) {
    if (e.name === "NotFound") {
      deps.console.error(`No "migrations" directory found.`);
      deps.exit(1);
    }
  }
}


async function up() {
  const flags = deps.parseArgs(deps.args, {
    boolean: ["help"],
    string: ["path"],
  });

  if (flags.help) {
    deps.console.log(`
Usage:  migrate up [OPTIONS]

Sequentially run all migrations that are newer than the current configured database's version.

Options:
  --help          Display usage information
  --path=<PATH>   Specify a file system path containing migration configuration

Environment:
  Migrate's database connection must be configured using the following environment variables:

  MIGRATE_DATABASE
  The name of the database (Default: postgres)

  MIGRATE_DATABASE_HOST
  The network host address of the database server (Default: localhost)

  MIGRATE_DATABASE_PORT
  The port the database is listening for connections on (Default: 5432)

  MIGRATE_DATABASE_USER
  The name of the database user to connect as (Default: postgres)

  MIGRATE_DATABASE_PASSWORD
  The password of the database user to authenticate with. If this is not set, the user will be prompted for a password on the command line
`);
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
      help();
    default:
      deps.console.log("migrate v0");
      deps.console.log(`run "migrate help" for usage information`);
  }
}
