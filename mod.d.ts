declare interface Client {
  connect(): Promise<void>;
  end(): Promise<void>;
  queryObject<T>(query: string): Promise<QueryResult<T>>;
}

declare interface QueryResult<Row> {
  rows: Row[];
}

declare interface Migration {
  migrate(db: Client): Promise<void>;
  revert(db: Client): Promise<void>;
}

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