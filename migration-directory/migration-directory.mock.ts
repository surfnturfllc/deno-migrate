import { test } from "../test.deps.ts";


export class MockMigrationDirectory {
  scan = test.stub().resolves();
  load = test.stub().resolves([]);

  get latestVersion(): number { return 420 }
}
