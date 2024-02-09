import { assert, faker, test } from "../test.deps.ts";

import { deps } from "../deps.ts";
import { MockMigrationFile } from "./migration-file.mock.ts";
import { MigrationFile } from "./migration-file.ts";


const { describe, it } = test;


describe("MigrationFile", () => {
  it("throws an error when instantiated with an unparsable file name", () => {
    const filename = "a noise annoys an oyster";
    assert.throws(() => { new MigrationFile("./migrations", filename) });
  });

  it("can be instantiated with a filename formatted {index}-{up|down}-{name}.sql", () => {
    const filename = "01-up-a-noise-annoys-an-oyster.sql";
    new MigrationFile("./migrations", filename);
  });

  it("parses its filename", () => {
    const filename = "01-up-a-noise-annoys-an-oyster.sql";
    const file = new MigrationFile("./migrations", filename);

    assert.equal(file.filename, filename);
    assert.equal(file.index, 1);
    assert.equal(file.direction, "up");
    assert.equal(file.name, "a-noise-annoys-an-oyster");
  });

  it("can load its contents from the filesystem", async () => {
    const content = faker.lorem.paragraph();
    test.stub(deps.fs, "readTextFile").resolves(content);

    const mock = new MockMigrationFile();
    const file = new MigrationFile("./migrations", mock.filename);

    assert.equal(await file.load(), content);
  });
});
