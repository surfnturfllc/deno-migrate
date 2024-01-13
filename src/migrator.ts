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
