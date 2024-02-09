import { 
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals, assertMatch, assertRejects, assertThrows } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { Client } from "https://deno.land/x/postgres@v0.17.1/mod.ts";

export const assert = {
  equal: assertEquals,
  match: assertMatch,
  rejects: assertRejects,
  throws: assertThrows,
};

export const test = {
  afterEach,
  beforeEach,
  describe,
  it,
};

export const postgres = { Client };
