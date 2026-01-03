import { Surreal } from 'surrealdb';

const endpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT || '';
const namespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE || '';
const token = process.env.EXPO_PUBLIC_RORK_DB_TOKEN || '';

class Database {
  private db: Surreal;
  private connected: boolean = false;
  private connecting: boolean = false;

  constructor() {
    this.db = new Surreal();
    console.log('[DB Init] Endpoint:', endpoint || 'MISSING');
    console.log('[DB Init] Namespace:', namespace || 'MISSING');
    console.log('[DB Init] Token:', token ? `SET (${token.substring(0, 10)}...)` : 'MISSING');
    console.log('[DB] SurrealDB database service initialized');
  }

  private async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.connect();
    }

    if (!endpoint || !namespace || !token) {
      throw new Error('[DB] Database credentials not configured. Please set EXPO_PUBLIC_RORK_DB_ENDPOINT, EXPO_PUBLIC_RORK_DB_NAMESPACE, and EXPO_PUBLIC_RORK_DB_TOKEN');
    }

    this.connecting = true;
    try {
      console.log('[DB] Connecting to:', endpoint);
      await this.db.connect(endpoint, {
        namespace: namespace.split('-')[0],
        database: namespace,
      });
      await this.db.authenticate(token);
      this.connected = true;
      console.log('[DB] ✓ Connected successfully');
    } catch (error: any) {
      console.error('[DB] ✗ Connection failed:', error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    await this.connect();
    try {
      console.log('[DB Query]', sql);
      const result = await this.db.query<[T[]]>(sql, vars);
      return result[0] || [];
    } catch (error: any) {
      console.error('[DB Query Error]', sql, error);
      throw error;
    }
  }

  async select<T = any>(table: string): Promise<T[]> {
    await this.connect();
    try {
      console.log('[DB Select]', table);
      const result = await this.db.select(table);
      return (Array.isArray(result) ? result : []) as T[];
    } catch (error: any) {
      console.error('[DB Select Error]', table, error);
      throw error;
    }
  }

  async create<T = any>(table: string, data: any): Promise<T> {
    await this.connect();
    try {
      console.log('[DB Create]', table);
      const result = await this.db.create(table, data);
      console.log('[DB] ✓ Created successfully');
      return result as T;
    } catch (error: any) {
      console.error('[DB Create Error]', table, error);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    await this.connect();
    try {
      console.log('[DB Update]', thing);
      const result = await this.db.merge(thing, data);
      console.log('[DB] ✓ Updated successfully');
      return result as T;
    } catch (error: any) {
      console.error('[DB Update Error]', thing, error);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    await this.connect();
    try {
      console.log('[DB Delete]', thing);
      await this.db.delete(thing);
      console.log('[DB] ✓ Deleted successfully');
    } catch (error: any) {
      console.error('[DB Delete Error]', thing, error);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    await this.connect();
    try {
      console.log('[DB Upsert]', `${table}:${id}`);
      const thing = `${table}:${id}`;
      const result = await this.db.merge(thing, data);
      console.log('[DB] ✓ Upserted successfully');
      return result as T;
    } catch (error: any) {
      console.error('[DB Upsert Error]', `${table}:${id}`, error);
      throw error;
    }
  }
}

export const database = new Database();
