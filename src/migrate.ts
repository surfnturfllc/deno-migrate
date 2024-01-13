import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import { MigrationLoader } from "./migration-loader.ts";
import { Migrator } from "./migrator.ts";


async function getDatabaseVersion(client: Client): Promise<number> {
  const { rows } = await client.queryObject<{ index: number }>(
    "SELECT index FROM _migrations ORDER BY index DESC LIMIT 1",
  );
  return rows[0].index;
}

const path = "./schema";

const loader = new MigrationLoader(path);
await loader.scan();

const client = new postgres.Client({
  database: "",
  hostname: "",
  port: 5432,
  user: "",
  password: "",
});

const databaseVersion = await getDatabaseVersion(client);

const migrations = await loader.load(databaseVersion);

const migrator = new Migrator(migrations);

await migrator.migrate(client);