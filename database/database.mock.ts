import { test } from "../test.deps.ts";

export class MockDatabase {
  initialize = test.stub();
  fetchVersion = test.stub();

  constructor(version = 69) {
    this.fetchVersion.resolves(version);
  }
}
