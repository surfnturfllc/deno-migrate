import { test } from "../test.deps.ts";

export function MockDatabase(version = 69) {
  return {
    fetchVersion: test.stub().resolves(version),
  };
}
