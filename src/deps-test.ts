import * as _path from "https://deno.land/std@0.212.0/path/mod.ts";
import { 
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals, assertRejects, assertThrows } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { default as sinon } from "npm:sinon";
import { faker as fakerMod } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";

import { MockClient } from "./postgres.mock.ts";
import { MockRevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.mock.ts";


export const assert = {
  equals: assertEquals,
  rejects: assertRejects,
  throws: assertThrows,

  pass: sinon.assert.pass,
  called: sinon.assert.called,
  calledOnce: sinon.assert.calledOnce,
  calledWith: sinon.assert.calledWith,
  calledWithNew: sinon.assert.calledWithNew,
  notCalled: sinon.assert.notCalled,
};

export const faker = fakerMod;

export const mocks = {
  RevertableSequence: MockRevertableSequence,
  Client: MockClient,
};

export const path = {
  parse: _path.parse,
};

export const stubs = {
  restore: sinon.restore,
  createInstance: sinon.createStubInstance,
};

export const test = {
  afterEach,
  beforeEach,
  describe,
  it,
  stub: sinon.stub,
  spy: sinon.spy,
};
