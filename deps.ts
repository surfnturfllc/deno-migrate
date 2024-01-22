import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

import { prompt } from "https://raw.githubusercontent.com/surfnturfllc/deno-cli/main/mod.ts";
import { RevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.ts";

export const deps = {
  console: {
    log: console.log,
    error: console.error,
  },
  env: {
    get: Deno.env.get,
  },
  postgres: {
    Client: postgres.Client,
  },
  prompt: {
    password: prompt.password,
  },
  RevertableSequence,
  fs: {
    readDir: Deno.readDir,
    readTextFile: Deno.readTextFile,
  },
};
