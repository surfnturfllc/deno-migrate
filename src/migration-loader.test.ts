import { describe, it } from "https://deno.land/std@0.210.0/testing/bdd.ts";


import sinon from "npm:sinon";
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";


import { MigrationLoader } from "./migration-loader.ts";


function createMockMigrationDirEntries(index: number) {
  const name = faker.random.words().toLowerCase().split(" ").join("-");
  return [
    {
      isFile: true,
      name: `${index}-up-${name}-${index}.sql`,
    },
    {
      isFile: true,
      name: `${index}-down-${name}-${index}.sql`,
    },
  ];
}

function createMockReadDir() {
  const entries = [];
  const count = 20;
  for (let index = 0; index < count; index++) {
    const [up, down] = createMockMigrationDirEntries(index);
    entries.push(up);
    entries.push(down);
  }
  return entries;
}

function createMockFS() {
  return {
    readDir: sinon.spy(createMockReadDir),
    readTextFile: sinon.spy(faker.lorem.paragraph),
  };
}


describe("MigrationLoader", () => {
  it("can be instantiated", () => {
    const fs = createMockFS();

    new MigrationLoader(faker.system.directoryPath(), fs);
    sinon.assert.pass();
  });

  it("can scan a directory for migrations", async () => {
    const fs = createMockFS();
    const mockPath = faker.system.directoryPath();

    const loader = new MigrationLoader(mockPath, fs);
    await loader.scan();

    sinon.assert.calledOnce(fs.readDir);
    sinon.assert.calledWith(fs.readDir, mockPath);
  });
});
