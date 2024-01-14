import { 
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import sinon from "npm:sinon";


import { Database } from "./database.ts";

import { MockClient } from "./postgres.mock.ts";


describe("Database", () => {
  afterEach(() => { sinon.restore() });

  it("can be instantiated", () => {
    new Database();
  });

  describe("fetchVersion", () => {
    it("can query the database for its most recent migration version", async () => {
      const client = new MockClient();
      const database = new Database();
      client.queryObject.resolves({ rows: [{ index: 69 }]});
      const version = await database.fetchVersion(client);

      sinon.assert.called(client.queryObject);
      assertEquals(version, 69);
    });
  });
});
