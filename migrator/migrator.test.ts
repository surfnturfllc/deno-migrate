import { assert, test, mocks, stubs } from "../test.deps.ts";
import { MockMigration } from "../migration/migration.mock.ts";

import { deps, Migrator } from "./migrator.ts";


const { afterEach, describe, it, stub } = test;


function generateMigrations(count = 10) {
  const migrations = [];
  for (let index = 1; index <= count; index++) {
    migrations.push(new MockMigration(index));
  }
  return migrations;
}


describe("Migrator", () => {
  it("can be instantiated", () => {
    new Migrator([]);
  });
});

describe("Migrator.prototype.migrate", () => {

  const client = new mocks.Client();
  const migrations = generateMigrations();

  afterEach(stubs.restore);

  it("processes a sequence of migrations", async () => {
    stub(deps, "RevertableSequence").callsFake(
      (actions: RevertableAction[]) => new mocks.RevertableSequence(actions),
    );

    const migrator = new Migrator(migrations);
    await migrator.migrate(client);

    assert.called(deps.RevertableSequence);

    for (const migration of migrations) {
      assert.called(migration.migrate);
    }
  });

  it("reverts a sequence of migrations", async () => {
    stub(deps, "RevertableSequence").callsFake(
      (actions: RevertableAction[]) => new mocks.RevertableSequence(actions, true),
    );

    const migrator = new Migrator(migrations);
    await migrator.migrate(client);

    assert.called(deps.RevertableSequence);

    for (const migration of migrations) {
      assert.called(migration.revert);
    }
  });
});
