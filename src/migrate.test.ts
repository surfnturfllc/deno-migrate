import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";

import sinon from "npm:sinon";


import { MockMigrationDirectory } from "./migration-directory.mock.ts";
import { MockMigrator } from "./migrator.mock.ts";
import { MockDatabase } from "./database.mock.ts";


import { _deps, command } from "./migrate.ts";

function MockClient() {
  return {};
}


describe("migrate command", () => {
  const fakeDBVersion = 69;

  const mocks = {
    client: MockClient(),
    directory: MockMigrationDirectory(),
    migrator: MockMigrator(),
    database: MockDatabase(fakeDBVersion),
  };

  beforeEach(() => {
    sinon.stub(_deps.console, "log").returns(undefined);
    sinon.stub(_deps.env, "get").returns("test environment value");
    sinon.stub(_deps.prompt, "password").resolves("test password");
    sinon.stub(_deps.postgres, "Client").returns(mocks.client);
    sinon.stub(_deps, "MigrationDirectory").returns(mocks.directory);
    sinon.stub(_deps, "Migrator").returns(mocks.migrator);
    sinon.stub(_deps, "Database").returns(mocks.database);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("is configured using env vars", async () => {
    await command();

    sinon.assert.calledWith(_deps.env.get, "MIGRATE_DATABASE");
    sinon.assert.calledWith(_deps.env.get, "MIGRATE_DATABASE_HOST");
    sinon.assert.calledWith(_deps.env.get, "MIGRATE_DATABASE_PORT");
    sinon.assert.calledWith(_deps.env.get, "MIGRATE_DATABASE_USER");
  });

  it("provides informational output and prompts user for password", async () => {
    await command();

    sinon.assert.called(_deps.console.log);
    sinon.assert.called(_deps.prompt.password);
  });

  it("connects to postgres and retrieves migration version", async () => {
    await command();

    sinon.assert.calledWithNew(_deps.postgres.Client);
    sinon.assert.calledWithNew(_deps.Database);
    sinon.assert.called(mocks.database.fetchVersion);
  });

  it("scans directory for migrations and loads those newer than current version", async () => {
    await command();

    sinon.assert.called(mocks.directory.scan);
    sinon.assert.called(mocks.directory.load);
  });

  it("creates a Migrator and calls it's migrate method", async () => {
    await command();

    sinon.assert.calledWithNew(_deps.Migrator);
    sinon.assert.called(mocks.migrator.migrate);
  });
});
