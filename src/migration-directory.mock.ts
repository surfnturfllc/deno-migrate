import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";
import sinon from "npm:sinon";


export function MockMigrationDirectory() {
  return {
    scan: sinon.stub().resolves(),
    load: sinon.stub().resolves([]),
  };
}


export function createFakeMigrationDirEntries(index: number) {
  const name = faker.random.words().toLowerCase().split(" ").join("-");
  return [
    { isFile: true, name: `${index}-up-${name}-${index}.sql` },
    { isFile: true, name: `${index}-down-${name}-${index}.sql` },
  ];
}

export function createFakeReadDir() {
  const entries = [];
  const count = 20;
  for (let index = 0; index < count; index++) {
    const [up, down] = createFakeMigrationDirEntries(index);
    entries.push(up);
    entries.push(down);
  }
  return entries;
}
