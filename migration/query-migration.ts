import { deps as external } from "../deps.ts";


export const deps = {
  ...external,
};


interface QueryMigrationConfig {
  index: number;
  name: string;
  migrate: string;
  revert: string;
}


export class QueryMigration implements Migration {
  private _index: number;
  private _name: string;
  private queries: { migrate: string, revert: string };

  constructor(config: QueryMigrationConfig) {
    const { index, name , migrate, revert } = config;
    this._index = index;
    this._name = name;
    this.queries = { migrate, revert };
  }

  get index() { return this._index }
  get name() { return this._name }

  async migrate(db: Client): Promise<void> {
    try {
      await db.connect();
      await db.queryArray(this.queries.migrate);
      await db.end();
    } catch (e) {
      if (e) {
        deps.console.error(e);
      }
      throw e;
    }
  }

  async revert(db: Client): Promise<void> {
    try {
      await db.connect();
      await db.queryArray(this.queries.revert);
      await db.end();
    } catch (e) {
      if (e) {
        deps.console.error(e);
      }
    }
  }
}
