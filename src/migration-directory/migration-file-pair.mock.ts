import { test } from "../deps-test.ts";

import { MockMigrationFile } from "./migration-file.mock.ts";


export class MockMigrationFilePair {
  static compare = test.stub();

  _up: MigrationFile;
  _down: MigrationFile;

  constructor(up: MockMigrationFile, down: MockMigrationFile) {
    this._up = up;
    this._down = down;
    this.complete.returns({ up, down });
  }

  add = test.stub();
  complete = test.stub();

  get up() { return this._up }
  get down() { return this._down}
}
