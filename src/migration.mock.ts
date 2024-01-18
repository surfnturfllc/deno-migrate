import { test } from "./deps-test.ts";


export class MockMigration implements Migration {
  private _index: number;
  private queries: { migrate: string; revert: string; };

  constructor(index: number) {
    this.queries = { migrate: "", revert: "" };
    this._index = index;
  }

  get index() { return this._index }

  migrate = test.stub().resolves();
  revert = test.stub().resolves();
}
