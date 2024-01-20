import { assert, faker, path, stubs, test } from "../deps-test.ts"

import { deps, MigrationDirectory } from "./migration-directory.ts";

import { MockMigration } from "../migration.mock.ts";
import { MockMigrationFile } from "./migration-file.mock.ts";
import { MockMigrationFilePair } from "./migration-file-pair.mock.ts";


const { afterEach, beforeEach, describe, it, stub } = test;


describe("MigrationDirectory", () => {
  const path = faker.system.directoryPath();

  beforeEach(() => {
    stub(deps.console, "error");
    stub(deps.fs, "readTextFile").returns(faker.lorem.paragraph());
  });

  afterEach(stubs.restore);

  it("can be instantiated", () => {
    stub(deps.fs, "readDir").returns(generateFakeReadDir());

    new MigrationDirectory(path);
  });

  describe("MigrationDirectory.prototype.scan", () => {
    it("can scan a directory for migrations", async () => {
      stub(deps.fs, "readDir").returns(generateFakeReadDir());

      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.calledOnce(deps.fs.readDir);
      assert.calledWith(deps.fs.readDir, path);
    });

    it("ignores non-files", async () => {
      stub(deps.fs, "readDir").returns(
        generateFakeReadDir().concat({ isFile: false, name: "foobar" }),
      );

      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.notCalled(deps.console.error);
    });

    it("prints an error message if it encounters an unparsable file name", async () => {
      stub(deps.fs, "readDir").returns([{ isFile: true, name: "invalid filename" }]);

      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.called(deps.console.error);
    });

    it("prints an error message if it encounters an unparsable file name", async () => {
      stub(deps.fs, "readDir").returns([{ isFile: true, name: "invalid filename" }]);

      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.called(deps.console.error);
    });

    it("throws an error if it encounters an up migration without a down", () => {
      stub(deps.fs, "readDir").returns([{ isFile: true, name: "01-up-foobar.sql" }]);

      const directory = new MigrationDirectory(path);

      assert.rejects(() => directory.scan());
    });

    it("throws an error if it encounters a down migration without an up", () => {
      stub(deps.fs, "readDir").returns([{ isFile: true, name: "01-down-foobar.sql" }]);

      const directory = new MigrationDirectory(path);

      assert.rejects(() => directory.scan());
    });
  });

  describe("MigrationDirectory.prototype.load", () => {
    it("reads migration file content and returns QueryMigrations", async () => {
      const upMigrationFiles = generateMigrationFiles(10);
      const downMigrationFiles = upMigrationFiles.map((file) => file.inverse());
      const migrationFiles = upMigrationFiles.concat(downMigrationFiles);
      const dirEntries = migrationFiles.map((e) => ({ isFile: true, name: e.filename }));
      const migrationFilePairs = upMigrationFiles.map(
        (up, index) => new MockMigrationFilePair(up, downMigrationFiles[index]),
      );

      stub(deps.fs, "readDir").returns(dirEntries);
      stub(deps, "MigrationFile").callsFake(stubGeneratorFromArray(migrationFiles));
      stub(deps, "MigrationFilePair").callsFake(stubGeneratorFromArray(migrationFilePairs))

      const directory = new MigrationDirectory(path);
      await directory.scan();
      await directory.load();

      for (const migrationFile of migrationFiles) {
        assert.called(migrationFile.load);
      }
    });
  });
});

function stubGeneratorFromArray<T>(a: Array<T>) {
  const generator = function* <T>(a: Array<T>) {
    while (true) yield* a;
  };
  const generate = generator(a);
  return () => generate.next().value;
}

function generateMigrationFiles(count: number) {
  const migrationFiles = [];
  for (let index = 0; index < count; index++) {
    migrationFiles.push(new MockMigrationFile());
  }
  return migrationFiles;
}


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
