import { Surreal } from 'surrealdb';

const DB_ENDPOINT = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
const DB_NAMESPACE = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
const DB_TOKEN = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

console.log('[ENV] DB_ENDPOINT:', DB_ENDPOINT ? `${DB_ENDPOINT.substring(0, 20)}...` : 'undefined');
console.log('[ENV] DB_NAMESPACE:', DB_NAMESPACE || 'undefined');
console.log('[ENV] DB_TOKEN:', DB_TOKEN ? 'Set' : 'undefined');

class Database {
  private db: Surreal | null = null;
  private connecting: Promise<void> | null = null;

  async connect() {
    if (this.db) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      try {
        console.log('[DB] Checking environment variables...');
        console.log('[DB] Endpoint:', DB_ENDPOINT || 'MISSING');
        console.log('[DB] Namespace:', DB_NAMESPACE || 'MISSING');
        console.log('[DB] Token:', DB_TOKEN ? 'Set' : 'MISSING');

        if (!DB_ENDPOINT || !DB_NAMESPACE || !DB_TOKEN) {
          throw new Error('Database environment variables are not configured. Please check EXPO_PUBLIC_RORK_DB_ENDPOINT, EXPO_PUBLIC_RORK_DB_NAMESPACE, and EXPO_PUBLIC_RORK_DB_TOKEN');
        }

        console.log('[DB] Connecting to database...');
        this.db = new Surreal();
        
        await this.db.connect(DB_ENDPOINT, {
          namespace: DB_NAMESPACE,
          database: 'happy_art',
        });

        await this.db.authenticate(DB_TOKEN);
        console.log('[DB] Connected successfully ✓');
      } catch (error) {
        console.error('[DB] Connection failed:', error);
        this.db = null;
        throw error;
      }
    })();

    await this.connecting;
    this.connecting = null;
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    try {
      await this.connect();
      console.log('[DB Query]', sql, vars);
      const result = await this.db!.query(sql, vars);
      console.log('[DB Result]', result);
      return (result[0] || []) as T[];
    } catch (error) {
      console.error('[DB Query Error]', error);
      throw error;
    }
  }

  async select<T = any>(table: string): Promise<T[]> {
    try {
      await this.connect();
      console.log('[DB Select]', table);
      const result = await this.db!.select(table);
      console.log('[DB Result]', result);
      if (Array.isArray(result)) {
        return result as T[];
      }
      return result ? [result as T] : [];
    } catch (error) {
      console.error('[DB Select Error]', table, error);
      throw error;
    }
  }

  async create<T = any>(table: string, data: any): Promise<T> {
    try {
      await this.connect();
      console.log('[DB Create]', table, data);
      const result = await this.db!.create(table, data);
      console.log('[DB Result]', result);
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Create Error]', table, error);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    try {
      await this.connect();
      console.log('[DB Update]', thing, data);
      const result = await this.db!.update(thing, data);
      console.log('[DB Result]', result);
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Update Error]', thing, error);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    try {
      await this.connect();
      console.log('[DB Delete]', thing);
      await this.db!.delete(thing);
    } catch (error) {
      console.error('[DB Delete Error]', thing, error);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    try {
      await this.connect();
      const thing = `${table}:${id}`;
      console.log('[DB Upsert]', thing, data);
      const result = await this.db!.merge(thing, data);
      console.log('[DB Result]', result);
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Upsert Error]', table, id, error);
      throw error;
    }
  }
}

export const database = new Database();
