import { 
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { default as sinon } from "npm:sinon";

import { MockClient } from "./postgres.mock.ts";
import { MockRevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.mock.ts";



export const assert = {
  equals: assertEquals,
  rejects: assertRejects,

  pass: sinon.assert.pass,
  called: sinon.assert.called,
  calledWith: sinon.assert.calledWith,
  calledWithNew: sinon.assert.calledWithNew,
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

export const mocks = {
  RevertableSequence: MockRevertableSequence,
  Client: MockClient,
};
