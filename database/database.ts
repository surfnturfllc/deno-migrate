import { Migrator } from "../migrator/migrator.ts";
import { QueryMigration } from "../migration/query-migration.ts";

export const deps = {
  Migrator,
  QueryMigration,
};

const queries = {
  initialize: {
    migrate: `
      CREATE TABLE _migrations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        index INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL
      );

      CREATE UNIQUE INDEX migrations_index_index ON _migrations (index DESC);
    `,
    revert: `
      DROP INDEX migrations_index_index;
      DROP TABLE IF EXISTS _migrations;
    `,
  },
};


export class Database {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async initialize(): Promise<void> {
    const migrator = new deps.Migrator([
      new deps.QueryMigration(
        1,
        queries.initialize.migrate,
        queries.initialize.revert,
      ),
    ]);
    await migrator.migrate(this.client);
  }

  async fetchVersion(): Promise<number> {
    const { rows } = await this.client.queryObject<{ index: number }>(
      "SELECT index FROM _migrations ORDER BY index DESC LIMIT 1",
    );
    return rows[0].index;
  }
}
