import { RevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.ts";


import { Migration } from "./migration.ts";


export class Migrator {
  migrations: Migration[];

  constructor(migrations: Migration[]) {
    this.migrations = migrations;
  }

  async migrate(client: Client) {
    const actions = this.migrations.map((migration) => ({
      process: () => migration.migrate(client),
      revert: () => migration.revert(client),
    }));

    const sequence = new RevertableSequence(actions);

    await sequence.process();
  }
}

//  database: string; // database name
//  hostname: string; // database host
//  port: number; // database port
//  user: string; // database user
//  password: string; // database password
//}

//async function migrate(client: Client, config: MigrateConfig) {
//  await client.connect();
//
//  const databaseVersion = await getDatabaseVersion(client);
//  const migrations = new MigrationDirectory(config.path);
//
//  const sequence = [];
//  for (const migration of migrations.newerThanVersion(databaseVersion)) {
//    sequence.push(migration);
//  }
//}
//
//async function getDatabaseVersion(client: Client): Promise<number> {
//  const query = "SELECT index FROM _migrations ORDER BY index DESC LIMIT 1";
//  const { rows } = await client.queryObject<{index: number}>(query);
//  return rows[0].index;
//}
//
//const migrationFilePattern = /^(\d+)-(up|down)-/;
//
//
//class MigrationDirectory {
//  path: string;
//  migrations: Migration[];
//
//  constructor(path: string) {
//    this.path = path;
//    this.migrations = [];
//  }
//
//  async read() {
//    const migrations: { [index: number]: Migration } = {};
//
//    for await (const entry of Deno.readDir(this.path)) {
//      if (!entry.isFile) continue;
//
//      const match = migrationFilePattern.exec(entry.name);
//      if (!match) continue;
//      const index = parseInt(match[1]);
//      const direction = match[2];
//
//      if (!migrations[index]) {
//        migrations[index] = { index, up: null, down: null };
//      }
//
//      if (direction === "up") {
//        migrations[index].up = entry.name;
//      } else if (direction === "down") {
//        migrations[index].down = entry.name;
//      }
//    }
//
//    const migrationsArray = [];
//    for (const [_, value] of Object.entries(migrations)) {
//      migrationsArray.push(value);
//    }
//
//    this.migrations = migrationsArray.sort((a, b) => {
//      if (a.index < b.index) return -1;
//      if (a.index > b.index) return 1;
//      return 0;
//    });
//  }
//
//  *newerThanVersion(version: number) {
//    for (const migration of this.migrations) {
//      if (migration.index > version) {
//        yield migration;
//      }
//    }
//  }
//}
//