import { deps } from "./deps.ts";


export class MigrationFile {
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
    return deps.fs.readTextFile(this.filename);
  }
}
