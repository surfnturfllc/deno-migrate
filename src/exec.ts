import { command } from "./migrate.ts";

if (import.meta.main) {
  await command();
}
