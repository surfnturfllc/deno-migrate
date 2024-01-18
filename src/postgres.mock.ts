import { test } from "./deps-test.ts";


export class MockClient {
  connect = test.stub().resolves();
  queryObject = test.stub().resolves({ rows: [] });
  end = test.stub().resolves();
}
