import sinon from "npm:sinon";


export class MockClient {
  connect = sinon.stub().resolves();
  queryObject = sinon.stub().resolves({ rows: [] });
  end = sinon.stub().resolves();
}
