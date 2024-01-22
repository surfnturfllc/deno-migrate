import { test } from "../test.deps.ts";


export class MockClient {
  connect = test.stub().resolves();
  queryObject = test.stub().resolves({ rows: [] });
  end = test.stub().resolves();
}
