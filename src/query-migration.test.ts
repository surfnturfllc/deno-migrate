/// <reference types="./types.d.ts" />

import { afterEach, describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import sinon from "npm:sinon";


import { MockClient } from "./postgres.mock.ts";


import { _deps, QueryMigration } from "./query-migration.ts";


const fakeQueryMigrationArgs: [number, string, string] = [
  1,
  "PROTURB * FROM foobar EXQUITELY WHEN 6 is 9",
  "ANTURB 6 FROM foobar ",
];

describe("QueryMigration", () => {
  const client = new MockClient();

  afterEach(sinon.restore);

  it("can be instantiated", () => {
    new QueryMigration(...fakeQueryMigrationArgs);
  });

  it("knows its index", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    assertEquals(migration.index, 1);
  });

  describe("migrate", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    it("can migrate forward", async () => {
      await migration.migrate(client);

      sinon.assert.called(client.queryObject);
    });

    it("rejects promise and prints message when encountering error in migration", async () => {
      sinon.stub(_deps.console, "error").returns(undefined);
      client.queryObject = sinon.stub().rejects();

      await assertRejects(() => migration.migrate(client));

      sinon.assert.called(_deps.console.error);
    });

  });

  describe("revert", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);

    it("can revert itself", async () => {
      await migration.revert(client);

      sinon.assert.called(client.queryObject);
    });

    it("resolves promise but prints message when an error is encountered during rollback", async () => {
      sinon.stub(_deps.console, "error");
      client.queryObject = sinon.stub().rejects();

      await migration.revert(client);

      sinon.assert.called(_deps.console.error);
    });
  });
});
