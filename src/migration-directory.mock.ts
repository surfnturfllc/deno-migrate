import sinon from "npm:sinon";


export function MockMigrationDirectory() {
  return {
    scan: sinon.stub().resolves(),
    load: sinon.stub().resolves([]),
  };
}
