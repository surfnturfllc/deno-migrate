import { assert, stubs, test } from "./test.deps.ts";
import mock from "./deps.mock.ts";


import { command, deps } from "./mod.ts";


const { beforeEach, afterEach, describe, it, spy, stub } = test;


describe("migrate command", () => {
  const fakeDBVersion = 69;

  const client = new mock.postgres.Client();
  const directory = new mock.MigrationDirectory();
  const migrator = new mock.Migrator();
  const database = new mock.Database(fakeDBVersion);

  let ClientSpy = spy();
  
  beforeEach(() => {
    stub(deps.console, "log").returns(undefined);
    stub(deps.env, "get").returns("test environment value");
    stub(deps.prompt, "password").resolves("test password");
    ClientSpy = stub(deps.postgres, "Client").returns(client);
    stub(deps, "MigrationDirectory").returns(directory);
    stub(deps, "Migrator").returns(migrator);
    stub(deps, "Database").returns(database);
  });

  afterEach(stubs.restore);

  it("is configured using env vars", async () => {
    await command();

    assert.calledWith(deps.env.get, "MIGRATE_DATABASE");
    assert.calledWith(deps.env.get, "MIGRATE_DATABASE_HOST");
    assert.calledWith(deps.env.get, "MIGRATE_DATABASE_PORT");
    assert.calledWith(deps.env.get, "MIGRATE_DATABASE_USER");

    const config = ClientSpy.getCall(0).firstArg;
    assert.equals(config.database, "test environment value");
    assert.equals(config.hostname, "test environment value");
    assert.equals(config.port, "test environment value");
    assert.equals(config.user, "test environment value");
    assert.equals(config.password, "test password");
  });

  it("uses default values if env vars aren't set", async () => {
    // deno-lint-ignore no-explicit-any
    (deps.env.get as any).restore();
    stub(deps.env, "get").returns(undefined);

    await command();

    const config = ClientSpy.getCall(0).firstArg;
    assert.equals(config.database, "postgres");
    assert.equals(config.hostname, "localhost");
    assert.equals(config.port, "5432");
    assert.equals(config.user, "postgres");
    assert.equals(config.password, "test password");
  });

  it("provides informational output and prompts user for password", async () => {
    await command();

    assert.called(deps.console.log);
    assert.called(deps.prompt.password);
  });

  it("connects to postgres and retrieves migration version", async () => {
    await command();

    assert.calledWithNew(deps.postgres.Client);
    assert.calledWithNew(deps.Database);
    assert.called(database.fetchVersion);
  });

  it("scans directory for migrations and loads those newer than current version", async () => {
    await command();

    assert.called(directory.scan);
    assert.called(directory.load);
  });

  it("creates a Migrator and calls it's migrate method", async () => {
    await command();

    assert.calledWithNew(deps.Migrator);
    assert.called(migrator.migrate);
  });
});
