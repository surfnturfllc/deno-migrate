import { faker, path, test } from "../test.deps.ts";


interface MockMigrationFileConfig {
  index?: number;
  direction?: string;
  name?: string;
  filename?: string;
}


export class MockMigrationFile {
  index: number;
  direction: string;
  name: string;
  filename: string;

  constructor(config?: MockMigrationFileConfig) {
    this.index = config?.index ?? faker.random.number({ max: 10000 });
    this.direction = config?.direction ?? faker.helpers.randomize(["up", "down"]);
    this.name = config?.name ?? path.parse(faker.system.fileName()).name;
    this.filename = config?.filename ?? `${this.index}-${this.direction}-${this.name}.sql`;
  }

  load = test.stub();

  inverse() {
    const mock = new MockMigrationFile();

    mock.index = this.index;
    mock.direction = this.direction === "up" ? "down" : "up";
    mock.name = this.name;
    mock.filename = `${mock.index}-${mock.direction}-${mock.name}.sql`;

    return mock;
  }
}
