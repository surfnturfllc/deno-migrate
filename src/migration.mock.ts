import sinon from "npm:sinon";


export class MockMigration implements Migration {
  private _index: number;
  private queries: { migrate: string; revert: string; };

  constructor(index: number) {
    this.queries = { migrate: "", revert: "" };
    this._index = index;
  }

  get index() { return this._index }

  migrate = sinon.stub().resolves();
  revert = sinon.stub().resolves();
}
