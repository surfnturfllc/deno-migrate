/// <reference types="./types.d.ts" />

import { QueryMigration } from "../query-migration.ts";
import { MigrationFile } from "./migration-file.ts";
import { MigrationFilePair } from  "./migration-file-pair.ts";


export const _deps = {
  console: {
    error: console.error,
  },
  fs: {
    readDir: Deno.readDir,
  },
};


export class MigrationDirectory {
  private path: string;
  private migrationPairs: CompleteMigrationFilePair[];

  constructor(path: string) {
    this.path = path;
    this.migrationPairs = [];
  }

  async scan(): Promise<void> {
    const incompletePairs: { [index: string]: MigrationFilePair } = {};

    for await (const entry of _deps.fs.readDir(this.path)) {
      if (!entry.isFile) continue;

      try {
        const migrationFile = new MigrationFile(entry.name);
        const { index, direction } = migrationFile;

        if (!incompletePairs[index]) {
          incompletePairs[index] = new MigrationFilePair();
        }

        incompletePairs[index].add(direction, migrationFile);
      } catch (error) {
        _deps.console.error(error);
        continue;
      }
    }

    this.migrationPairs = Object.values(incompletePairs).map(
      (pair) => pair.complete(),
    );

    this.migrationPairs.sort(MigrationFilePair.compare);
  }

  async load(from = 0, to?: number): Promise<Migration[]> {
    if (to === undefined) {
      to = this.migrationPairs[this.migrationPairs.length - 1].up.index;
    }

    const toLoad = [];
    for (const pair of this.migrationPairs) {
      if (pair.up.index >= from && pair.up.index < to) {
        toLoad.push(pair);
      }
    }

    const migrations = [];
    for (const pair of toLoad) {
      migrations.push(new QueryMigration(
        pair.up.index,
        await pair.up.load(),
        await pair.down.load(),
      ));
    }

    return migrations;
  }
}
