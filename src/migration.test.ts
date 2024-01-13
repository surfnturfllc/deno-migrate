/// <reference types="./types.d.ts" />

import { describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";

import sinon from "npm:sinon";


import { Migration } from "./migration.ts";
import { assertRejects } from "https://deno.land/std@0.210.0/assert/mod.ts";


const createMockClient = () => ({
  connect: sinon.spy(() => Promise.resolve()),
  queryObject: sinon.spy(() => Promise.resolve({ rows: [] })),
  end: sinon.spy(() => Promise.resolve()),
});

const createMockErrorClient = () => ({
  connect: sinon.spy(() => Promise.resolve()),
  queryObject: sinon.spy(() => Promise.reject()),
  end: sinon.spy(() => Promise.resolve()),
});

const createTestMigration = () => new Migration(
  1,
  "PROTURB * FROM foobar EXQUITELY WHEN 6 is 9",
  "ANTURB 6 FROM foobar ",
);


describe("Migration", () => {
  it("can be instantiated", () => {
    createTestMigration();
    sinon.assert.pass();
  });

  it("can migrate forward", async () => {
    const mockClient = createMockClient();
    const migration = createTestMigration();
    await migration.migrate(mockClient);

    sinon.assert.called(mockClient.queryObject);
  });

  it("can revert itself", async () => {
    const mockClient = createMockClient();
    const migration = createTestMigration();
    await migration.revert(mockClient);

    sinon.assert.called(mockClient.queryObject);
  });

  it("rejects promise when encountering error in migration", () => {
    const mockClient = createMockErrorClient();
    const migration = createTestMigration();
    assertRejects(async () => await migration.migrate(mockClient));
  });

  it("ignores error encountered during rollback", async () => {
    const mockClient = createMockErrorClient();
    const migration = createTestMigration();
    await migration.revert(mockClient);
  });
});
