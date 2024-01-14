declare interface MigrationFile {
  load(): Promise<string>;
  get filename(): string;
  get index(): number;
  get direction(): string;
  get name(): string;
}

declare interface CompleteMigrationFilePair {
  up: MigrationFile;
  down: MigrationFile;
}
