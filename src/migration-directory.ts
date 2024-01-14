import { QueryMigration } from "./query-migration.ts";

export const _deps = {
  console: {
    error: console.error,
  },
  fs: {
    readTextFile: Deno.readTextFile,
    readDir: Deno.readDir,
  },
};


const migrationFilePattern = /^(\d+)-(up|down)-(.*)\.sql$/;

class MigrationFile {
  private _filename: string;
  private _index: number;
  private _direction: string;
  private _name: string;

  constructor(filename: string) {
    const match = migrationFilePattern.exec(filename);
    if (!match) {
      throw new Error(`Unable to parse filename: ${filename}`)
    }

    this._filename = filename;
    this._index = parseInt(match[1]);
    this._direction = match[2];
    this._name = match[3]
  }

  get filename() { return this._filename }
  get index() { return this._index }
  get direction() { return this._direction }
  get name() { return this._name }

  load(): Promise<string> {
    return _deps.fs.readTextFile(this.filename);
  }
}

class IncompleteMigrationPair {
  private _up?: MigrationFile;
  private _down?: MigrationFile;

  add(direction: string, migrationFile: MigrationFile) {
    if (direction === "up") {
      this._up = migrationFile;
    } else if (direction === "down") {
      this._down = migrationFile;
    } else {
      throw new Error(`Migration file must specify "up" or "down".`);
    }
  }

  get up() { return this._up }
  get down() { return this._down}
}

interface MigrationPair {
  up: MigrationFile;
  down: MigrationFile;
}


export class MigrationDirectory {
  private path: string;
  private migrationPairs: MigrationPair[];

  constructor(path: string) {
    this.path = path;
    this.migrationPairs = [];
  }

  async scan(): Promise<void> {
    const incompletePairs: { [index: string]: IncompleteMigrationPair } = {};

    for await (const entry of _deps.fs.readDir(this.path)) {
      if (!entry.isFile) continue;

      try {
        const migrationFile = new MigrationFile(entry.name);
        const { index, direction } = migrationFile;

        if (!["up", "down"].includes(direction)) {
          throw new Error(`Migration file name, ${migrationFile.filename}, does not specify "up" or "down".`);
        }

        if (!this.migrationPairs[index]) {
          incompletePairs[index] = new IncompleteMigrationPair();
        }

        incompletePairs[index].add(direction, migrationFile);
      } catch (error) {
        _deps.console.error(error);
        continue;
      }
    }

    for (const migrationPair of Object.values(this.migrationPairs)) {
      if (migrationPair.up === undefined) {
        throw new Error(`Missing "up" migration for file ${migrationPair.down?.filename}.`);
      }

      if (migrationPair.down === undefined) {
        throw new Error(`Missing "down" migration for file ${migrationPair.up?.filename}.`);
      }

      this.migrationPairs.push({ up: migrationPair.up, down: migrationPair.down });
    }

    this.migrationPairs.sort((a, b) => {
      if (a.up.index < b.up.index) return -1;
      if (a.up.index > b.up.index) return 1;
      return 0;
    });
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
