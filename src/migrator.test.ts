import { 
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";

import sinon from "npm:sinon";

import { MockRevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.mock.ts";


import { _deps, Migrator } from "./migrator.ts";


import { MockClient } from "./postgres.mock.ts";
import { MockMigration, MockErrorMigration } from "./migration.mock.ts";


function MockMigrations(count = 10) {
  const migrations = [];
  for (let index = 1; index <= count; index++) {
    migrations.push(new MockMigration(index));
  }
  return migrations;
}

function MockActions(client: Client, migrations: Migration[]) {
  return migrations.map((migration) => ({
    process: () => migration.migrate(client),
    revert: () => migration.revert(client),
  }));
}


describe("Migrator", () => {
  it("can be instantiated", () => {
    new Migrator([]);
    sinon.assert.pass();
  });

  describe("migrate", () => {
    const mocks = {
      client: new MockClient(),
      migrations: MockMigrations(),
    };

    afterEach(() => {
      sinon.restore();
    });

    it("processes a sequence of migrations", async () => {
      sinon.stub(_deps, "RevertableSequence").callsFake(
        (actions: RevertableAction[]) => new MockRevertableSequence(actions),
      );

      const migrator = new Migrator(mocks.migrations);
      await migrator.migrate(mocks.client);

      sinon.assert.called(_deps.RevertableSequence);

      for (const migration of mocks.migrations) {
        sinon.assert.called(migration.migrate);
      }
    });

    it("reverts a sequence of migrations", async () => {
      sinon.stub(_deps, "RevertableSequence").callsFake(
        (actions: RevertableAction[]) => new MockRevertableSequence(actions, true),
      );

      const migrator = new Migrator(mocks.migrations);
      await migrator.migrate(mocks.client);

      sinon.assert.called(_deps.RevertableSequence);

      for (const migration of mocks.migrations) {
        sinon.assert.called(migration.revert);
      }
    });
  });
});
