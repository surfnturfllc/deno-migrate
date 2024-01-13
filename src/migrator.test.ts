import { describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";

import sinon from "npm:sinon";


import { Migrator } from "./migrator.ts";


describe("Migrator", () => {
  it("can be instantiated", () => {
    new Migrator([]);
    sinon.assert.pass();
  });
});
