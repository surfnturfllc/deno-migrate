import { afterEach, describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";

import sinon from "npm:sinon";
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";


import { _deps, MigrationDirectory } from "./migration-directory.ts";

import { createFakeReadDir } from "./migration-directory.mock.ts";


describe("MigrationDirectory", () => {
  afterEach(sinon.restore);

  it("can be instantiated", () => {
    sinon.stub(_deps.fs, "readDir").returns(createFakeReadDir());
    sinon.stub(_deps.fs, "readTextFile").returns(faker.lorem.paragraph());

    const path = faker.system.directoryPath();

    new MigrationDirectory(path);
  });

  describe("scan", () => {
    it("can scan a directory for migrations", async () => {
      sinon.stub(_deps.fs, "readDir").returns(createFakeReadDir());
      sinon.stub(_deps.fs, "readTextFile").returns(faker.lorem.paragraph());

      const path = faker.system.directoryPath();
      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.calledOnce(_deps.fs.readDir);
      sinon.assert.calledWith(_deps.fs.readDir, path);
    });

    it("prints an error message if it encounters an unparsable file name", async () => {
      const dirEntries = createFakeReadDir().concat({ isFile: true, name: "invalid filename" });
      sinon.stub(_deps.fs, "readDir").returns(dirEntries);
      sinon.stub(_deps.fs, "readTextFile").returns(faker.lorem.paragraph());
      sinon.stub(_deps.console, "error");

      const path = faker.system.directoryPath();
      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.called(_deps.console.error);
    });
  });
});
