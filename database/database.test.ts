import { assert, test, stubs } from "../test.deps.ts";
import mock from "../deps.mock.ts";

import { deps, Database } from "./database.ts";


const { afterEach, describe, it, stub } = test;


describe("Database", () => {
  afterEach(stubs.restore);

  it("can be instantiated", () => {
    new Database(new mock.postgres.Client());
  });

  describe("Database.prototype.initialize", async () => {
    const migrator = new mock.Migrator();
    stub(deps, "QueryMigration").returns(new mock.Migration());
    stub(deps, "Migrator").returns(migrator);

    const client = new mock.postgres.Client();
    const database = new Database(client);
    await database.initialize();

    assert.calledWithNew(deps.QueryMigration);
    assert.calledWithNew(deps.Migrator);
    assert.called(migrator.migrate);
  });

  describe("Database.prototype.fetchVersion", () => {
    it("can query the database for its most recent migration version", async () => {
      const client = new mock.postgres.Client();
      const database = new Database(client);
      client.queryObject.resolves({ rows: [{ index: 69 }]});
      const version = await database.fetchVersion();

      assert.called(client.queryObject);
      assert.equal(version, 69);
    });
  });
});
