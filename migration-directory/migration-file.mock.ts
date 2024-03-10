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

  constructor(_path?: string, _filename?: string) {
    this.index = 0;
    this.direction = "";
    this.name = "";
    this.filename = "";
  }

  static Fake(config?: MockMigrationFileConfig): MockMigrationFile {
    const fake = new MockMigrationFile();
    fake.index = config?.index ?? faker.random.number({ max: 10000 });
    fake.direction = config?.direction ?? faker.helpers.randomize(["up", "down"]);
    fake.name = config?.name ?? path.parse(faker.system.fileName()).name;
    fake.filename = config?.filename ?? `${fake.index}-${fake.direction}-${fake.name}.sql`;
    return fake;
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
