export class MigrationFilePair {
  static compare(a: CompleteMigrationFilePair, b: CompleteMigrationFilePair) {
    return a.up.index - b.up.index;
  }

  private _up?: MigrationFile;
  private _down?: MigrationFile;

  add(file: MigrationFile) {
    if (file.direction === "up") {
      this._up = file;
    } else { // MigrationFile enforces direction is always "up" or "down"
      this._down = file;
    }
  }

  complete(): CompleteMigrationFilePair {
    if (this._up == null || this._down == null) {
      throw new Error("Unable to complete migration pair.");
    }

    return { up: this._up, down: this._down };
  }

  get up() { return this._up }
  get down() { return this._down}
}