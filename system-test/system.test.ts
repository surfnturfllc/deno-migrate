import { assert, copy, postgres, path, test } from "./deps.ts";


const { afterEach, beforeEach, describe, it } = test;


async function migrate(...args: string[]) {
  const env = {
    MIGRATE_DATABASE: "migrate-system-test",
    MIGRATE_DATABASE_HOST: "migrate-system-test-postgres",
    MIGRATE_DATABASE_USER: "migrate-system-test",
    MIGRATE_DATABASE_PASSWORD: "migrate-system-test",
  };

  const command = new Deno.Command("bin/migrate", { env, args });

  const { code, stdout, stderr } = await command.output();

  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}


describe("migrate cli", () => {
  let db: Client;

  async function transaction(...queries: string[]) {
    const t = db.createTransaction("system-test");
    await t.begin();
    for (const q of queries) {
      await t.queryArray(q);
    }
    await t.commit();
  }

  beforeEach(async () => {
    db = new postgres.Client({
      database: "migrate-system-test",
      hostname: "migrate-system-test-postgres",
      user: "migrate-system-test",
      password: "migrate-system-test",
    });

    await db.connect();
  });

  afterEach(async () => {
    await transaction(
      `DROP SCHEMA public CASCADE;`,
      `CREATE SCHEMA public;`,
      `GRANT ALL ON SCHEMA public TO "migrate-system-test";`,
      `GRANT ALL ON SCHEMA public TO public;`,
      `COMMENT ON SCHEMA public IS 'standard public schema';`,
    );
    await db.end();
  });

  describe("migrate", () => {
    it("runs successfully", async () => {
      const { code, stderr } = await migrate();
      assert.equal(code, 0);
      assert.equal(stderr, "");
    });
  });

  describe("migrate help", () => {
    it("displays usage information", async () => {
      const { code, stdout, stderr } = await migrate("help");

      assert.equal(code, 0);
      assert.equal(stderr, "");
      assert.match(stdout, /\w+/);
    });
  });

  describe("migrate initialize", () => {
    it("displays usage information when --help flag present", async () => {
      const { code, stderr, stdout } = await migrate("initialize", "--help");

      assert.equal(code, 0);
      assert.equal(stderr, "");
      assert.match(stdout, /\w+/);
    });

    it("runs sucessfully", async () => {
      const { code, stderr } = await migrate("initialize");

      assert.equal(code, 0);
      assert.equal(stderr, "");

      const { rows } = await db.queryObject<{ index: number }>(`SELECT * FROM _migrations`);

      assert.equal(rows.length, 1);
      const current = rows[0];
      assert.equal(current.index, 0);
    });
  });

  describe("migrate version", () => {
    it("prints an error message if run against an uninitialized database", async () => {
      const { code, stderr } = await migrate("version");

      assert.equal(code, 1);
      assert.equal(stderr, `Database has not been initialized. Please run "migrate initialize".\n`);
    });

    it("prints the current version of the managed database", async () => {
      {
        const { code } = await migrate("initialize");
        assert.equal(code, 0);
      }

      const { code, stdout, stderr } = await migrate("version");

      assert.equal(code, 0);
      assert.equal(stderr, "");
      assert.match(stdout, /\b0\b/);
    });
  });

  describe("migrate up", () => {
    it("displays usage information when --help flag present", async () => {
      const { code, stderr, stdout } = await migrate("up", "--help");

      assert.equal(code, 0);
      assert.equal(stderr, "");
      assert.match(stdout, /\w+/);
    });

    it("runs sucessfully", async () => {
      await migrate("initialize");

      {
        const result = await db.queryObject<{ index: number }>(`SELECT index FROM _migrations`);
        assert.equal(result.rows[0].index, 0);
      }

      const { code, stderr } = await migrate("up");

      assert.equal(code, 0);
      assert.equal(stderr, "");

      await db.queryArray(`INSERT INTO people (name, address, email) VALUES ('Bob', '123 Bob St.', 'bob@bobcom.com')`);

      {
        const result = await db.queryObject<{ name: string; address: string; email: string }>(`SELECT * FROM people LIMIT 1`);
        const { name, address, email } = result.rows[0];

        assert.equal(name, "Bob");
        assert.equal(address, "123 Bob St.");
        assert.equal(email, "bob@bobcom.com");
      }

      {
        const result = await db.queryObject<{ index: number }>(`SELECT index FROM _migrations ORDER BY index DESC LIMIT 1`);
        assert.equal(result.rows[0].index, 3);
      }
    });

    it("can read migrations from a specific directory if --path is present", async () => {
      await migrate("initialize");

      const tempDir = path.join(await Deno.makeTempDir(), "migrations");

      await copy("system-test/migrations", tempDir);

      const { code, stderr } = await migrate("up", `--path=${tempDir}`);

      assert.equal(code, 0);
      assert.equal(stderr, "");
    });
  });
});
