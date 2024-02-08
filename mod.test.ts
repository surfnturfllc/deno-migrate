import { assert, stubs, test } from "./test.deps.ts";
import mock from "./deps.mock.ts";

import { command, deps } from "./mod.ts";

const { beforeEach, afterEach, describe, it, spy, stub } = test;


function mockArgs(args: string[], fn: () => unknown) {
  return async () => {
    const old = { args: deps.args };
    deps.args = ["migrate"].concat(args);

    try {
      await fn();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      deps.args = old.args;
    }
  };
}


describe("migrate command", () => {
  const fakeDBVersion = 69;

  const client = new mock.postgres.Client();
  const directory = new mock.MigrationDirectory();
  const migrator = new mock.Migrator();
  const database = new mock.Database(fakeDBVersion);

  let ClientSpy = spy();
  
  beforeEach(() => {
    stub(deps.console, "log").returns(undefined);
    stub(deps.env, "get").callsFake((key = "default") => {
      switch (key) {
        case "MIGRATE_DATABASE_PASSWORD":
          return undefined;
        default:
          return "test environment value";
      }
    });
    stub(deps.prompt, "password").resolves("test password");
    ClientSpy = stub(deps.postgres, "Client").returns(client);
    stub(deps, "MigrationDirectory").returns(directory);
    stub(deps, "Migrator").returns(migrator);
    stub(deps, "Database").returns(database);
  });

  afterEach(stubs.restore);

  describe("migrate help", () => {
    it("displays usage instructions", mockArgs(["help"], async () => {
      await command();
      assert.called(deps.console.log);
    }));
  });

  describe("migrate initialize", () => {
    it("displays usage information if --help flag is present", mockArgs(["initialize", "--help"], async () => {
      await command();

      assert.called(deps.console.log);
    }));

    it("is configured using env vars", mockArgs(["initialize"], async () => {
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
    }));

    it("uses default values if env vars aren't set", mockArgs(["initialize"], async () => {
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
    }));

    it("provides informational output and prompts user for password", mockArgs(["initialize"], async () => {
      await command();

      assert.called(deps.console.log);
      assert.called(deps.prompt.password);
    }));
  });


  describe("migrate up", () => {
    it("displays usage information if --help flag is present", mockArgs(["up", "--help"], async () => {
      await command();

      assert.called(deps.console.log);
    }));

    it("connects to postgres and retrieves migration version", mockArgs(["up"], async () => {
      await command();

      assert.calledWithNew(deps.postgres.Client);
      assert.calledWithNew(deps.Database);
      assert.called(database.fetchVersion);
    }));

    it("scans directory for migrations and loads those newer than current version", mockArgs(["up"], async () => {
      await command();

      assert.called(directory.scan);
      assert.called(directory.load);
    }));

    it("creates a Migrator and calls it's migrate method", mockArgs(["up"], async () => {
      await command();

      assert.calledWithNew(deps.Migrator);
      assert.called(migrator.migrate);
    }));
  });
});
