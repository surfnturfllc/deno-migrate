import sinon from "npm:sinon";


export function MockMigrator() {
  return {
    migrate: sinon.stub().resolves(),
  };
}
