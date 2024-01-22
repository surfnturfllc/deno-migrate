import { assert, test, mocks, stubs } from "../test.deps.ts";


import { Database } from "./database.ts";


const { afterEach, describe, it } = test;


describe("Database", () => {
  afterEach(stubs.restore);

  it("can be instantiated", () => {
    new Database();
  });

  describe("fetchVersion", () => {
    it("can query the database for its most recent migration version", async () => {
      const client = new mocks.Client();
      const database = new Database();
      client.queryObject.resolves({ rows: [{ index: 69 }]});
      const version = await database.fetchVersion(client);

      assert.called(client.queryObject);
      assert.equals(version, 69);
    });
  });
});
