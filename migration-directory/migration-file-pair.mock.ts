import { test } from "../test.deps.ts";

import { MockMigrationFile } from "./migration-file.mock.ts";


export class MockMigrationFilePair {
  static compare = test.stub();

  _up: MigrationFile;
  _down: MigrationFile;

  constructor(up?: MigrationFile, down?: MigrationFile) {
    this._up = up ?? new MockMigrationFile();
    this._down = down ?? MockMigrationFile.prototype.inverse.apply(this.up)
    this.complete.returns({ up, down });
  }

  add = test.stub();
  complete = test.stub();

  get up() { return this._up }
  get down() { return this._down}
}
