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
