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
  private _latestVersion: number;

  constructor(path: string) {
    this.path = path;
    this.migrationPairs = [];
    this._latestVersion = 0;
  }

  async scan(): Promise<void> {
    const incompletePairs: { [index: string]: MigrationFilePair } = {};

    const entries = deps.fs.readDir(this.path);
    for await (const entry of entries) {
      if (!entry.isFile) continue;

      const file = new deps.MigrationFile(this.path, entry.name);

      if (!incompletePairs[file.index]) {
        incompletePairs[file.index] = new deps.MigrationFilePair();
      }

      if (file.index > this._latestVersion) {
        this._latestVersion = file.index;
      }

      incompletePairs[file.index].add(file);
    }

    this.migrationPairs = Object.values(incompletePairs).map(
      (pair) => pair.complete(),
    );

    this.migrationPairs.sort(MigrationFilePair.compare);
  }

  async load(from = 0, to?: number): Promise<Migration[]> {
    if (to === undefined) {
      to = this.migrationPairs[0].up.index;
    }

    const toLoad = [];
    for (const pair of this.migrationPairs) {
      if (pair.up.index > from && pair.up.index <= to) {
        toLoad.push(pair);
      }
    }

    const migrations = [];
    for (const pair of toLoad) {
      migrations.push(new deps.QueryMigration({
        index: pair.up.index,
        name: pair.up.name,
        migrate: await pair.up.load(),
        revert: await pair.down.load(),
      }));
    }

    return migrations;
  }

  get latestVersion(): number {
    return this._latestVersion;
  }
}
