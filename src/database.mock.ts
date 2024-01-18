import { test } from "./deps-test.ts";

export function MockDatabase(version = 69) {
  return {
    fetchVersion: test.stub().resolves(version),
  };
}
