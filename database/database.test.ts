import { assert, test, stubs } from "../test.deps.ts";
import mock from "../deps.mock.ts";

import { deps, Database } from "./database.ts";


const { afterEach, describe, it, stub } = test;


describe("Database", () => {
  afterEach(stubs.restore);

  it("can be instantiated", () => {
    new Database();
  });

  describe("Database.prototype.initialize", async () => {
    const migrator = new mock.Migrator();
    stub(deps, "QueryMigration").returns(new mock.Migration());
    stub(deps, "Migrator").returns(migrator);

    const client = new mock.postgres.Client();
    const database = new Database();
    await database.initialize(client);

    assert.calledWithNew(deps.QueryMigration);
    assert.calledWithNew(deps.Migrator);
    assert.called(migrator.migrate);
  });

  describe("Database.prototype.fetchVersion", () => {
    it("can query the database for its most recent migration version", async () => {
      const client = new mock.postgres.Client();
      const database = new Database();
      client.queryObject.resolves({ rows: [{ index: 69 }]});
      const version = await database.fetchVersion(client);

      assert.called(client.queryObject);
      assert.equals(version, 69);
    });
  });
});
