import * as path from "https://deno.land/std@0.215.0/path/mod.ts";
import { parseArgs } from "https://deno.land/std@0.215.0/cli/parse_args.ts";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { ConnectionParamsError } from "https://deno.land/x/postgres@v0.17.0/client/error.ts";
import { PostgresError } from "https://deno.land/x/postgres@v0.17.0/mod.ts";


import { prompt } from "https://raw.githubusercontent.com/surfnturfllc/deno-cli/main/mod.ts";
import { RevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.ts";

export const deps = {
  args: Deno.args,
  console: {
    log: console.log,
    error: console.error,
  },
  env: {
    get: Deno.env.get,
  },
  path,
  parseArgs,
  postgres: {
    Client: postgres.Client,
    ConnectionParamsError,
    PostgresError,
  },
  prompt: {
    password: prompt.password,
  },
  RevertableSequence,
  fs: {
    readDir: Deno.readDir,
    readTextFile: Deno.readTextFile,
  },
  exit: Deno.exit,
};
