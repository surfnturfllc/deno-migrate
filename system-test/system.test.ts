import { assert, test } from "./deps.ts";


const { describe, it } = test;


async function migrate(...args: string[]) {
  const env = {
    MIGRATE_DATABASE: "migrate-system-test",
    MIGRATE_DATABASE_HOST: "migrate-system-test-postgres",
    MIGRATE_DATABASE_USER: "migrate-system-test",
    MIGRATE_DATABASE_PASSWORD: "migrate-system-test",
  };

  const command = new Deno.Command("bin/migrate", { env, args });

  return await command.output();
}


describe("migrate", () => {
  it("runs", async () => {
    const { code, stderr } = await migrate("initialize");
    assert.equals(0, code);
    assert.equals("", new TextDecoder().decode(stderr));
  });
});
