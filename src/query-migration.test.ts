/// <reference types="./types.d.ts" />

import { describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import sinon from "npm:sinon";


import { MockClient } from "./postgres.mock.ts";


import { QueryMigration } from "./query-migration.ts";


const fakeQueryMigrationArgs: [number, string, string] = [
  1,
  "PROTURB * FROM foobar EXQUITELY WHEN 6 is 9",
  "ANTURB 6 FROM foobar ",
];

describe("Migration", () => {
  it("can be instantiated", () => {
    new QueryMigration(...fakeQueryMigrationArgs);
  });

  it("knows its index", () => {
    const migration = new QueryMigration(...fakeQueryMigrationArgs);
    assertEquals(migration.index, 1);
  });

  it("can migrate forward", async () => {
    const client = new MockClient();
    const migration = new QueryMigration(...fakeQueryMigrationArgs);
    await migration.migrate(client);

    sinon.assert.called(client.queryObject);
  });

  it("can revert itself", async () => {
    const client = new MockClient();
    const migration = new QueryMigration(...fakeQueryMigrationArgs);
    await migration.revert(client);

    sinon.assert.called(client.queryObject);
  });

  it("rejects promise when encountering error in migration", () => {
    const client = new MockClient();
    client.queryObject = sinon.stub().rejects();

    const migration = new QueryMigration(...fakeQueryMigrationArgs);
    assertRejects(async () => await migration.migrate(client));
  });

  it("ignores error encountered during rollback", async () => {
    const client = new MockClient();
    client.queryObject = sinon.stub().rejects();

    const migration = new QueryMigration(...fakeQueryMigrationArgs);
    await migration.revert(client);
  });
});
