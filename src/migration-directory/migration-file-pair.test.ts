import { assert, test } from "../deps-test.ts";

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
      new MockMigrationFile({ index: 3, direction: "up" }),
    );
    const highIndexPair = new MockMigrationFilePair(
      new MockMigrationFile({ index: 10, direction: "up" }),
    );
    
    assert.equals(MigrationFilePair.compare(lowIndexPair, highIndexPair), -1);
    assert.equals(MigrationFilePair.compare(lowIndexPair, lowIndexPair), 0);
    assert.equals(MigrationFilePair.compare(highIndexPair, lowIndexPair), 1);
  });

  it("can add migration files and make them readable", () => {
    const pair = new MigrationFilePair();

    const upfile = new MockMigrationFile({ direction: "up" });
    pair.add(upfile);
    assert.equals(pair.up, upfile);

    const downfile = upfile.inverse();
    pair.add(downfile);
    assert.equals(pair.down, downfile);
  });

  it("can return an version of itself guaranteed to be complete", () => {
    const upPair = new MigrationFilePair();
    const upFile = new MockMigrationFile({ direction: "up" });
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
    assert.equals(complete.up, upFile);
    assert.equals(complete.down, downFile);
  });
});
