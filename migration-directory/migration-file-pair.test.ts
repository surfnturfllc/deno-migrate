import { assert, test } from "../test.deps.ts";

import { MigrationFilePair } from "./migration-file-pair.ts";

import { MockMigrationFile } from "./migration-file.mock.ts";
import { MockMigrationFilePair } from "./migration-file-pair.mock.ts";


const { describe, it } = test;


describe("MigrationFilePair", () => {
  it("can be instantiated", () => {
    new MigrationFilePair();
  });

  it("can be compared with other instances of itself", () => {
    const lowIndexPair = new MockMigrationFilePair(
      MockMigrationFile.Fake({ index: 3, direction: "up" }),
    );
    const highIndexPair = new MockMigrationFilePair(
      MockMigrationFile.Fake({ index: 10, direction: "up" }),
    );
    
    assert.lessThan(MigrationFilePair.compare(lowIndexPair, highIndexPair), 0)
    assert.equal(MigrationFilePair.compare(lowIndexPair, lowIndexPair), 0);
    assert.greaterThan(MigrationFilePair.compare(highIndexPair, lowIndexPair), 0);
  });

  it("can add migration files and make them readable", () => {
    const pair = new MigrationFilePair();

    const upfile = MockMigrationFile.Fake({ direction: "up" });
    pair.add(upfile);
    assert.equal(pair.up, upfile);

    const downfile = upfile.inverse();
    pair.add(downfile);
    assert.equal(pair.down, downfile);
  });

  it("can return an version of itself guaranteed to be complete", () => {
    const upPair = new MigrationFilePair();
    const upFile = MockMigrationFile.Fake({ direction: "up" });
    upPair.add(upFile);
    assert.throws(() => upPair.complete());

    const downFile = upFile.inverse();
    const downPair = new MigrationFilePair();
    downPair.add(downFile);
    assert.throws(() => downPair.complete());

    const pair = new MigrationFilePair();
    pair.add(upFile);
    pair.add(downFile);
    const complete = pair.complete();
    assert.equal(complete.up, upFile);
    assert.equal(complete.down, downFile);
  });
});
