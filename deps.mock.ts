import { test } from "./test.deps.ts";

import { MockRevertableSequence } from "https://raw.githubusercontent.com/surfnturfllc/deno-af/main/src/revertable-sequence.mock.ts";

import { MockDatabase } from "./database/database.mock.ts";
import { MockMigration } from "./migration/migration.mock.ts";
import { MockMigrationDirectory } from "./migration-directory/migration-directory.mock.ts";
import { MockMigrator } from "./migrator/migrator.mock.ts";


export class MockTransaction {
  begin = test.stub().resolves();
  queryObject = test.stub().resolves();
  queryArray = test.stub().resolves();
  commit = test.stub().resolves();
}

export class MockClient {
  connect = test.stub().resolves();
  queryObject = test.stub().resolves({ rows: [] });
  queryArray = test.stub().resolves({ rows: [] });
  createTransaction = test.stub().callsFake(() => new MockTransaction());
  end = test.stub().resolves();
}


export default {
  postgres: {
    Client: MockClient,
  },

  RevertableSequence: MockRevertableSequence,

  Database: MockDatabase,
  Migration: MockMigration,
  MigrationDirectory: MockMigrationDirectory,
  Migrator: MockMigrator,
};
