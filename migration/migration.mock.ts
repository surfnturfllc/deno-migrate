import { test } from "../test.deps.ts";


export class MockMigration implements Migration {
  private _index: number;
  private _name: string;

  constructor(index = 1, name = "Latka") {
    this._index = index;
    this._name = name;
  }

  get index() { return this._index }
  get name() { return this._name }

  migrate = test.stub().resolves();
  revert = test.stub().resolves();
}
