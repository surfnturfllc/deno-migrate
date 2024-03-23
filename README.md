# Migrate

Migrate is a tool ideal for, you guessed it, database migrations. It only supports PostgreSQL. While it may be used like any other command-line Linux/macOS tool, it is written for Deno and exports an API which may be used to embed it within other Deno projects.


# Installation

From the root directory of the deno-migrate source code, you can install the `migrate` executable into the current environent with:

    make install


# Usage

When run with no command-line arguments, `migrate` will print it's version, basic usage information, and scan for a project, if it finds one it will also display information about that project.


# Environment Variables
Migrate's database connection must be configured using the following environment variables:

- `MIGRATE_DATABASE`: The name of the database (Default: postgres)
- `MIGRATE_DATABASE_HOST`: The network host address of the database server (Default: localhost)
- `MIGRATE_DATABASE_PORT`: The port the database is listening for connections on (Default: 5432)
- `MIGRATE_DATABASE_USER`: The name of the database user to connect as (Default: postgres)
- `MIGRATE_DATABASE_PASSWORD`: The password of the database user to authenticate with. If this is not set the user will be prompted for a password on the command line


# Subcommands

- `migrate help`: Display basic usage information
- `migrate initialize`: Prepares the configured database for management
- `migrate version`: Display version information about the current configured database and environment
- `migrate up`: Run all migrations more recent than the database's version
