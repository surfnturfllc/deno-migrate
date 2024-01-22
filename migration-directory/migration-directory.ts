import { QueryMigration } from "../migration/query-migration.ts";
import { MigrationFile } from "./migration-file.ts";
import { MigrationFilePair } from  "./migration-file-pair.ts";

import { deps as external } from "../deps.ts";


export const deps = {
  ...external,
  QueryMigration,
  MigrationFile,
  MigrationFilePair,
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

    const entries = deps.fs.readDir(this.path);
    for await (const entry of entries) {
      if (!entry.isFile) continue;

      try {
        const file = new deps.MigrationFile(entry.name);

        if (!incompletePairs[file.index]) {
          incompletePairs[file.index] = new deps.MigrationFilePair();
        }

        incompletePairs[file.index].add(file);
      } catch (error) {
        deps.console.error(error);
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
      if (pair.up.index > from && pair.up.index <= to) {
        toLoad.push(pair);
      }
    }

    const migrations = [];
    for (const pair of toLoad) {
      migrations.push(new deps.QueryMigration(
        pair.up.index,
        await pair.up.load(),
        await pair.down.load(),
      ));
    }

    return migrations;
  }
}
