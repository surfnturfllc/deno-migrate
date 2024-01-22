import { test } from "../test.deps.ts";


export function MockMigrationDirectory() {
  return {
    scan: test.stub().resolves(),
    load: test.stub().resolves([]),
  };
}
