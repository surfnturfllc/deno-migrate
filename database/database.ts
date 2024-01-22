export class Database {
  async fetchVersion(client: Client): Promise<number> {
    const { rows } = await client.queryObject<{ index: number }>(
      "SELECT index FROM _migrations ORDER BY index DESC LIMIT 1",
    );
    return rows[0].index;
  }
}
