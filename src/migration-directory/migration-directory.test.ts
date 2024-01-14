import * as path from "https://deno.land/std@0.212.0/path/mod.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertRejects } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import sinon from "npm:sinon";
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";

import { _deps, MigrationDirectory } from "./migration-directory.ts";


describe("MigrationDirectory", () => {
  const path = faker.system.directoryPath();

  beforeEach(() => {
    sinon.stub(_deps.console, "error");
    sinon.stub(_deps.fs, "readTextFile").returns(faker.lorem.paragraph());
  });

  afterEach(sinon.restore);

  it("can be instantiated", () => {
    sinon.stub(_deps.fs, "readDir").returns(generateFakeReadDir());

    new MigrationDirectory(path);
  });

  describe("MigrationDirectory.prototype.scan", () => {
    it("can scan a directory for migrations", async () => {
      sinon.stub(_deps.fs, "readDir").returns(generateFakeReadDir());

      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.calledOnce(_deps.fs.readDir);
      sinon.assert.calledWith(_deps.fs.readDir, path);
    });

    it("ignores non-files", async () => {
      sinon.stub(_deps.fs, "readDir").returns(
        generateFakeReadDir().concat({ isFile: false, name: "foobar" }),
      );

      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.notCalled(_deps.console.error);
    });

    it("prints an error message if it encounters an unparsable file name", async () => {
      sinon.stub(_deps.fs, "readDir").returns([{ isFile: true, name: "invalid filename" }]);

      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.called(_deps.console.error);
    });

    it("prints an error message if it encounters an unparsable file name", async () => {
      sinon.stub(_deps.fs, "readDir").returns([{ isFile: true, name: "invalid filename" }]);

      const directory = new MigrationDirectory(path);
      await directory.scan();

      sinon.assert.called(_deps.console.error);
    });

    it("throws an error if it encounters an up migration without a down", () => {
      sinon.stub(_deps.fs, "readDir").returns([{ isFile: true, name: "01-up-foobar.sql" }]);

      const directory = new MigrationDirectory(path);

      assertRejects(() => directory.scan());
    });

    it("throws an error if it encounters a down migration without an up", () => {
      sinon.stub(_deps.fs, "readDir").returns([{ isFile: true, name: "01-down-foobar.sql" }]);

      const directory = new MigrationDirectory(path);

      assertRejects(() => directory.scan());
    });
  });

  describe("MigrationDirectory.prototype.load", () => {
    it("reads migration file content and returns QueryMigrations", async () => {

    });
  });
});


function generateFakeMigrationDirEntries(index: number) {
  const name = path.parse(faker.system.fileName()).name;
  return {
    up: { isFile: true, name: `${index}-up-${name}.sql` },
    down: { isFile: true, name: `${index}-down-${name}.sql` },
  };
}


function generateFakeReadDir() {
  const entries = [];
  const count = 5;
  for (let index = 0; index < count; index++) {
    const { up, down } = generateFakeMigrationDirEntries(index);
    entries.push(up);
    entries.push(down);
  }
  return entries;
}
