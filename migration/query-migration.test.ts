import { assert, test } from "../test.deps.ts";
import mock from "../deps.mock.ts";

import { deps } from "../deps.ts";

import { QueryMigration } from "../migration/query-migration.ts";


const { afterEach, beforeEach, describe, it, stub } = test;


const fakeQueryMigration = {
  index: 0,
  name: "wilbur",
  migrate: "PROTURB * FROM foobar EXQUITELY WHEN 6 is 9",
  revert: "ANTURB 6 FROM foobar ",
};

describe("QueryMigration", () => {
  let client = new mock.postgres.Client();

  beforeEach(() => {
    client = new mock.postgres.Client();
  });

  afterEach(test.stubs.restore);

  it("can be instantiated", () => {
    new QueryMigration(fakeQueryMigration);
  });

  it("knows its name and index", () => {
    const migration = new QueryMigration(fakeQueryMigration);

    assert.equal(migration.name, "wilbur");
    assert.equal(migration.index, 0);
  });

  describe("migrate", () => {
    const migration = new QueryMigration(fakeQueryMigration);

    it("can migrate forward", async () => {
      await migration.migrate(client);

      assert.called(client.queryArray);
    });

    it("rejects promise and prints message when encountering error in migration", async () => {
      stub(deps.console, "error").returns(undefined);
      client.queryArray = stub().rejects();

      await assert.rejects(() => migration.migrate(client));

      assert.called(deps.console.error);
    });
  });

  describe("revert", () => {
    const migration = new QueryMigration(fakeQueryMigration);

    it("can revert itself", async () => {
      await migration.revert(client);

      assert.called(client.queryArray);
    });

    it("resolves promise but prints message when an error is encountered during rollback", async () => {
      stub(deps.console, "error");
      client.queryArray = stub().rejects();

      await migration.revert(client);

      assert.called(deps.console.error);
    });
  });
});
