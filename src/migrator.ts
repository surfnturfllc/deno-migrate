import { deps as external } from "./deps.ts";


export const deps = {
  ...external,
};


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

    const sequence = new deps.RevertableSequence(actions);

    await sequence.process();
  }
}
