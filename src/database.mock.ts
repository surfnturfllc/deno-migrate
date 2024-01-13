import sinon from "npm:sinon";

export function MockDatabase(version = 69) {
  return {
    fetchVersion: sinon.stub().resolves(version),
  };
}
