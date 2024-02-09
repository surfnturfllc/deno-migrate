declare interface Transaction {
  begin(): Promise<void>;
  queryArray<T>(query: string): Promise<QueryResult<T>>;
  commit(): Promise<void>;
}

declare interface Client {
  connect(): Promise<void>;
  end(): Promise<void>;
  queryObject<T>(query: string): Promise<QueryResult<T>>;
  queryArray<T>(query: string): Promise<QueryResult<T>>;
  createTransaction(name: string): Transaction;
}

declare interface QueryResult<Row> {
  rows: Row[];
}

declare interface Migration {
  get index(): number;
  get name(): string;

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
