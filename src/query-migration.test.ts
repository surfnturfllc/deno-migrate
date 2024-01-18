/// <reference types="./types.d.ts" />
import { assert, mocks, stubs, test } from "./deps-test.ts";
import { deps } from "./deps.ts";


import { QueryMigration } from "./query-migration.ts";


const { afterEach, beforeEach, describe, it, stub } = test;


const fakeQueryMigrationArgs: [number, string, string] = [
  1,
  "PROTURB * FROM foobar EXQUITELY WHEN 6 is 9",
  "ANTURB 6 FROM foobar ",
];

describe("QueryMigration", () => {
  let client = new mocks.Client();

  beforeEach(() => {
    client = new mocks.Client();
  });

  afterEach(stubs.restore);

  it("can be instantiated", () => {
    new QueryMigration(...fakeQueryMigrationArgs);
  });

  it("knows its index", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    assert.equals(migration.index, 1);
  });

  describe("migrate", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    it("can migrate forward", async () => {
      await migration.migrate(client);

      assert.called(client.queryObject);
    });

    it("rejects promise and prints message when encountering error in migration", async () => {
      stub(deps.console, "error").returns(undefined);
      client.queryObject = stub().rejects();

      await assert.rejects(() => migration.migrate(client));

      assert.called(deps.console.error);
    });

  });

  describe("revert", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    it("can revert itself", async () => {
      await migration.revert(client);

      assert.called(client.queryObject);
    });

    it("resolves promise but prints message when an error is encountered during rollback", async () => {
      stub(deps.console, "error");
      client.queryObject = stub().rejects();

      await migration.revert(client);

      assert.called(deps.console.error);
    });
  });
});
