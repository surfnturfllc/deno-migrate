declare interface Client {
  connect(): Promise<void>;
  end(): Promise<void>;
  queryObject<T>(query: string): Promise<QueryResult<T>>;
}

declare interface QueryResult<Row> {
  rows: Row[];
}
