import { test } from "./test.deps.ts";

import { MockRevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.mock.ts";


export class MockClient {
  connect = test.stub().resolves();
  queryObject = test.stub().resolves({ rows: [] });
  end = test.stub().resolves();
}


export default {
  RevertableSequence: MockRevertableSequence,
  postgres: {
    Client: MockClient,
  },
};
