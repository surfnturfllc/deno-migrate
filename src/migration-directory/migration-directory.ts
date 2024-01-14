import { QueryMigration } from "../query-migration.ts";


export const _deps = {
  console: {
    error: console.error,
  },
  fs: {
    readTextFile: Deno.readTextFile,
    readDir: Deno.readDir,
  },
};


export class MigrationDirectory {
  private path: string;
  private migrationPairs: MigrationFilePair[];

  constructor(path: string) {
    this.path = path;
    this.migrationPairs = [];
  }

  async scan(): Promise<void> {
    const incompletePairs: { [index: string]: IncompleteMigrationFilePair } = {};

    for await (const entry of _deps.fs.readDir(this.path)) {
      if (!entry.isFile) continue;

      try {
        const migrationFile = new MigrationFile(entry.name);
        const { index, direction } = migrationFile;

        if (!incompletePairs[index]) {
          incompletePairs[index] = new IncompleteMigrationFilePair();
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


class MigrationFile {
  static pattern = /^(\d+)-(up|down)-(.*)\.sql$/;

  private _filename: string;
  private _index: number;
  private _direction: string;
  private _name: string;

  constructor(filename: string) {
    const match = MigrationFile.pattern.exec(filename);
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


class IncompleteMigrationFilePair {
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

  complete() {
    if (this._up == null || this._down == null) {
      throw new Error("Unable to complete migration pair.");
    }

    return new MigrationFilePair(this._up, this._down);
  }

  get up() { return this._up }
  get down() { return this._down}
}


class MigrationFilePair {
  up: MigrationFile;
  down: MigrationFile;

  static compare(a: MigrationFilePair, b: MigrationFilePair) {
    if (a.up.index < b.up.index) return -1;
    if (a.up.index > b.up.index) return 1;
    return 0;
  }

  constructor(up: MigrationFile, down: MigrationFile) {
    this.up = up;
    this.down = down;
  }
}
