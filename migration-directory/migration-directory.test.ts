import { assert, faker, path, test } from "../test.deps.ts"

import { deps, MigrationDirectory } from "./migration-directory.ts";

import { MockMigrationFile } from "./migration-file.mock.ts";
import { MockMigrationFilePair } from "./migration-file-pair.mock.ts";


const { afterEach, beforeEach, describe, it, stub } = test;


describe("MigrationDirectory", () => {
  const path = faker.system.directoryPath();
  const upMigrationFiles = generateMigrationFiles(10);
  const downMigrationFiles = upMigrationFiles.map((file) => file.inverse());
  const migrationFiles = upMigrationFiles.concat(downMigrationFiles).sort((a, b) => a.index - b.index);
  const dirEntries = migrationFiles.map((e) => ({ isFile: true, name: e.filename }));
  const migrationFilePairs = upMigrationFiles.map(
    (up, index) => new MockMigrationFilePair(up, downMigrationFiles[index]),
  );

  let stubs = {
    console: {
      error: stub(),
    },
    fs: {
      readDir: stub(),
      readTextFile: stub(),
    },
    MigrationFile: stub(),
    MigrationFilePair: stub(),
  };

  beforeEach(() => {
    stubs = {
      console: {
        error: stub(deps.console, "error"),
      },
      fs: {
        readDir: stub(deps.fs, "readDir").returns(dirEntries),
        readTextFile: stub(deps.fs, "readTextFile").returns(faker.lorem.paragraph()),
      },
      MigrationFile: stub(deps, "MigrationFile").callsFake(stubGeneratorFromArray(migrationFiles)),
      MigrationFilePair: stub(deps, "MigrationFilePair").callsFake(stubGeneratorFromArray(migrationFilePairs)),
    };
  });

  afterEach(test.stubs.restore);

  it("can be instantiated", () => {
    new MigrationDirectory(path);
    assert.pass();
  });

  describe("MigrationDirectory.prototype.scan", () => {
    it("can scan a directory for migrations", async () => {
      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.calledOnce(deps.fs.readDir);
      assert.calledWith(deps.fs.readDir, path);
    });

    it("ignores non-files", async () => {
      stubs.fs.readDir.returns(
        generateFakeReadDir({ isFile: false, name: "foobar" }),
      );

      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.notCalled(deps.console.error);
    });

    it("throws an error if it encounters an up migration without a down", async () => {
      stubs.fs.readDir.returns([{ isFile: true, name: "01-up-foobar.sql" }]);
      stubs.MigrationFilePair.restore();

      const directory = new MigrationDirectory(path);

      await assert.rejects(() => directory.scan());
    });

    it("throws an error if it encounters a down migration without an up", async () => {
      stubs.fs.readDir.returns([{ isFile: true, name: "01-down-foobar.sql" }]);
      stubs.MigrationFilePair.restore();

      const directory = new MigrationDirectory(path);

      await assert.rejects(async () => await directory.scan());
    });
  });

  describe("MigrationDirectory.prototype.latestVersion", () => {
    it("after scanning, it returns the version of the project's latest migration", async () => {
      const directory = new MigrationDirectory(path);
      await directory.scan();

      assert.equal(directory.latestVersion, upMigrationFiles[upMigrationFiles.length - 1].index);
    });
  });

  describe("MigrationDirectory.prototype.load", () => {
    it("reads migration file content and returns QueryMigrations", async () => {
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
    migrationFiles.push(MockMigrationFile.Fake({ direction: "up" }));
  }
  return migrationFiles.sort((a, b) => a.index - b.index);
}


function generateFakeMigrationDirEntries(index: number) {
  const name = path.parse(faker.system.fileName()).name;
  return {
    up: { isFile: true, name: `${index}-up-${name}.sql` },
    down: { isFile: true, name: `${index}-down-${name}.sql` },
  };
}


interface DirEntry { isFile: boolean; name: string }
function* generateFakeReadDir(...entries: DirEntry[]) {
  const count = 5;
  let index;
  for (index = 0; index < count; index++) {
    const { up, down } = generateFakeMigrationDirEntries(index);
    yield up;
    yield down;
  }
  for (const entry of entries) {
    yield entry;
  }
}
