import { Surreal } from 'surrealdb';

const DB_ENDPOINT = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
const DB_NAMESPACE = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
const DB_TOKEN = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

class Database {
  private db: Surreal | null = null;
  private connecting: Promise<void> | null = null;

  async connect() {
    if (this.db) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      console.log('[DB] Connecting to database...');
      this.db = new Surreal();
      
      await this.db.connect(DB_ENDPOINT!, {
        namespace: DB_NAMESPACE,
        database: 'happy_art',
      });

      await this.db.authenticate(DB_TOKEN!);
      console.log('[DB] Connected successfully');
    })();

    await this.connecting;
    this.connecting = null;
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    await this.connect();
    console.log('[DB Query]', sql, vars);
    const result = await this.db!.query(sql, vars);
    console.log('[DB Result]', result);
    return (result[0] || []) as T[];
  }

  async select<T = any>(table: string): Promise<T[]> {
    await this.connect();
    console.log('[DB Select]', table);
    const result = await this.db!.select(table);
    console.log('[DB Result]', result);
    if (Array.isArray(result)) {
      return result as T[];
    }
    return result ? [result as T] : [];
  }

  async create<T = any>(table: string, data: any): Promise<T> {
    await this.connect();
    console.log('[DB Create]', table, data);
    const result = await this.db!.create(table, data);
    console.log('[DB Result]', result);
    return (Array.isArray(result) ? result[0] : result) as T;
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    await this.connect();
    console.log('[DB Update]', thing, data);
    const result = await this.db!.update(thing, data);
    console.log('[DB Result]', result);
    return (Array.isArray(result) ? result[0] : result) as T;
  }

  async delete(thing: string): Promise<void> {
    await this.connect();
    console.log('[DB Delete]', thing);
    await this.db!.delete(thing);
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    await this.connect();
    const thing = `${table}:${id}`;
    console.log('[DB Upsert]', thing, data);
    const result = await this.db!.merge(thing, data);
    console.log('[DB Result]', result);
    return (Array.isArray(result) ? result[0] : result) as T;
  }
}

export const database = new Database();
