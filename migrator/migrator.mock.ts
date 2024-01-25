import { test } from "../test.deps.ts";


export class MockMigrator {
  migrate = test.stub().resolves();
}
