import * as _path from "https://deno.land/std@0.212.0/path/mod.ts";
import { 
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assert as assertTrue, assertEquals, assertMatch, assertRejects, assertThrows } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { default as sinon } from "npm:sinon";
import { faker as fakerMod } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";


export const assert = {
  true: assertTrue,
  equal: assertEquals,
  match: assertMatch,
  rejects: assertRejects,
  throws: assertThrows,
  lessThan: (actual: number, expected: number) => assertTrue(expected < actual),
  greaterThan: (actual: number, expected: number) => assertTrue(expected > actual),

  pass: sinon.assert.pass,
  called: sinon.assert.called,
  calledOnce: sinon.assert.calledOnce,
  calledWith: sinon.assert.calledWith,
  calledWithNew: sinon.assert.calledWithNew,
  notCalled: sinon.assert.notCalled,
};

export const faker = fakerMod;

export const path = {
  parse: _path.parse,
};

export const test = {
  afterEach,
  beforeEach,
  describe,
  it,
  stub: sinon.stub,
  spy: sinon.spy,
  stubs: {
    restore: sinon.restore,
    createInstance: sinon.createStubInstance,
  },
};
