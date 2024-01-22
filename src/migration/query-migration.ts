import { deps as external } from "../deps.ts";


export const deps = {
  ...external,
};


export class QueryMigration implements Migration {
  private _index: number;
  private queries: { migrate: string, revert: string };
  
  constructor(index: number, migrate: string, revert: string) {
    this._index = index;
    this.queries = { migrate, revert };
  }

  get index() { return this._index }

  async migrate(db: Client): Promise<void> {
    try {
      await db.connect();
      await db.queryObject(this.queries.migrate);
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
      await db.queryObject(this.queries.revert);
      await db.end();
    } catch (e) {
      if (e) {
        deps.console.error(e);
      }
    }
  }
}
