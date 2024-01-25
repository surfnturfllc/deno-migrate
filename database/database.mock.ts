import { test } from "../test.deps.ts";

export class MockDatabase {
  fetchVersion = test.stub();

  constructor(version = 69) {
    this.fetchVersion.resolves(version);
  }
}
