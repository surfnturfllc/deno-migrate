import { test } from "./deps-test.ts";


export function MockMigrator() {
  return {
    migrate: test.stub().resolves(),
  };
}
