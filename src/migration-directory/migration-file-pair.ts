export class MigrationFilePair {
  static compare(a: CompleteMigrationFilePair, b: CompleteMigrationFilePair) {
    if (a.up.index < b.up.index) return -1;
    if (a.up.index > b.up.index) return 1;
    return 0;
  }

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

  complete(): CompleteMigrationFilePair {
    if (this._up == null || this._down == null) {
      throw new Error("Unable to complete migration pair.");
    }

    return { up: this._up, down: this._down };
  }

  get up() { return this._up }
  get down() { return this._down}
}