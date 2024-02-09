import { deps as external } from "../deps.ts";


export const deps = {
  ...external,
};


export class Migrator {
  migrations: Migration[];

  constructor(migrations: Migration[]) {
    this.migrations = migrations;
  }

  async migrate(db: Client) {
    const actions = this.migrations.map((migration) => ({
      process: () => migration.migrate(db),
      revert: () => migration.revert(db),
    }));

    const sequence = new deps.RevertableSequence(actions);

    await sequence.process();

    const { index, name } = this.migrations[this.migrations.length - 1];
    await db.connect();
    await db.queryArray(`INSERT INTO _migrations (index, name) VALUES ('${index}', '${name}')`);
    await db.end();
  }
}
