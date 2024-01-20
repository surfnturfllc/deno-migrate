import { faker, path, test } from "../deps-test.ts";


export class MockMigrationFile {
  index = faker.random.number({ max: 10000 });
  direction = faker.helpers.randomize(["up", "down"]);
  name = path.parse(faker.system.fileName()).name;
  filename = `${this.index}-${this.direction}-${this.name}.sql`;

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
