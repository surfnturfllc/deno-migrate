import { command } from "./mod.ts";

if (import.meta.main) {
  try {
    await command();
  } catch (err: unknown) {
    console.error("Unknown error occurred at runtime:");
    console.error(err);
  }
}
