import { test } from "../test.deps.ts";


export function MockMigrator() {
  return {
    migrate: test.stub().resolves(),
  };
}
