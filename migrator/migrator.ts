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

    await db.connect();
    const t = db.createTransaction("update migrations table");

    await t.begin();
    for (const m of this.migrations) {
      await t.queryArray(`INSERT INTO _migrations (index, name) VALUES ('${m.index}', '${m.name}')`);
    }
    await t.commit();

    await db.end();
  }
}
