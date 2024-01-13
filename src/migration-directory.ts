import { Migration } from "./migration.ts";


interface DirEntry {
  isFile: boolean;
  name: string;
}


interface FileSystem {
  readTextFile(url: string): Promise<string>;
  readDir(path: string): AsyncIterable<DirEntry>;
}


const migrationFilePattern = /^(\d+)-(up|down)-(.*)\.sql$/;

class MigrationFile {
  private fs: FileSystem;

  private _filename: string;
  private _index: number;
  private _direction: string;
  private _name: string;

  constructor(filename: string, fs: FileSystem = Deno) {
    const match = migrationFilePattern.exec(filename);
    if (!match) {
      throw new Error(`Unable to parse filename: ${filename}`)
    }

    this.fs = fs;

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
    return this.fs.readTextFile(this.filename);
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
  private fs: FileSystem;

  private path: string;
  private migrationPairs: MigrationPair[];

  constructor(path: string, fs: FileSystem = Deno) {
    this.fs = fs;
    this.path = path;
    this.migrationPairs = [];
  }

  async scan(): Promise<void> {
    const incompletePairs: { [index: string]: IncompleteMigrationPair } = {};

    for await (const entry of this.fs.readDir(this.path)) {
      if (!entry.isFile) continue;

      try {
        const migrationFile = new MigrationFile(entry.name, this.fs);
        const { index, direction } = migrationFile;

        if (!["up", "down"].includes(direction)) {
          throw new Error(`Migration file name, ${migrationFile.filename}, does not specify "up" or "down".`);
        }

        if (!this.migrationPairs[index]) {
          incompletePairs[index] = new IncompleteMigrationPair();
        }

        incompletePairs[index].add(direction, migrationFile);
      } catch (error) {
        console.error(error);
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
      migrations.push(new Migration(
        pair.up.index,
        await pair.up.load(),
        await pair.down.load(),
      ));
    }

    return migrations;
  }
}
