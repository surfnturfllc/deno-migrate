import { test } from "./deps-test.ts";


export class MockMigration implements Migration {
  private _index: number;

  constructor(index = 1) {
    this._index = index;
  }

  get index() { return this._index }

  migrate = test.stub().resolves();
  revert = test.stub().resolves();
}
