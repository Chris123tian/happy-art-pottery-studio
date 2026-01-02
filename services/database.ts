import { Surreal } from 'surrealdb';
import Constants from 'expo-constants';

const getEnvVar = (key: string): string | undefined => {
  return process.env[key] || Constants.expoConfig?.extra?.[key];
};

const DB_ENDPOINT = getEnvVar('EXPO_PUBLIC_RORK_DB_ENDPOINT');
const DB_NAMESPACE = getEnvVar('EXPO_PUBLIC_RORK_DB_NAMESPACE');
const DB_TOKEN = getEnvVar('EXPO_PUBLIC_RORK_DB_TOKEN');

console.log('[DB Init] Endpoint:', DB_ENDPOINT || 'MISSING');
console.log('[DB Init] Namespace:', DB_NAMESPACE || 'MISSING');
console.log('[DB Init] Token:', DB_TOKEN ? `SET (${DB_TOKEN.substring(0, 10)}...)` : 'MISSING');

const isDatabaseConfigured = () => {
  const hasEndpoint = DB_ENDPOINT && DB_ENDPOINT.trim() !== '';
  const hasNamespace = DB_NAMESPACE && DB_NAMESPACE.trim() !== '';
  const hasToken = DB_TOKEN && DB_TOKEN.trim() !== '';
  return Boolean(hasEndpoint && hasNamespace && hasToken);
};

class Database {
  private db: Surreal | null = null;
  private connecting: Promise<void> | null = null;
  private connectionFailed = false;
  private lastConnectionAttempt = 0;
  private readonly RETRY_DELAY = 5000;

  constructor() {
    console.log('[DB] Database service initialized');
    if (!isDatabaseConfigured()) {
      console.warn('[DB] Database credentials missing. Please configure environment variables.');
    }
  }

  private shouldRetryConnection(): boolean {
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.RETRY_DELAY) {
      return false;
    }
    this.lastConnectionAttempt = now;
    return true;
  }

  async connect() {
    if (this.db) return;
    if (this.connecting) return this.connecting;

    if (!isDatabaseConfigured()) {
      throw new Error('[DB] Database credentials not configured. Please set EXPO_PUBLIC_RORK_DB_ENDPOINT, EXPO_PUBLIC_RORK_DB_NAMESPACE, and EXPO_PUBLIC_RORK_DB_TOKEN');
    }

    if (this.connectionFailed && !this.shouldRetryConnection()) {
      throw new Error('[DB] Connection failed previously, retrying in a moment...');
    }

    this.connecting = (async () => {
      try {
        console.log('[DB] Connecting to:', DB_ENDPOINT);
        this.db = new Surreal();
        
        await this.db.connect(DB_ENDPOINT!, {
          namespace: DB_NAMESPACE!,
          database: 'happy_art',
        });

        await this.db.authenticate(DB_TOKEN!);
        console.log('[DB] ✓ Connected successfully');
        this.connectionFailed = false;
      } catch (error) {
        console.error('[DB] ✗ Connection failed:', error);
        this.db = null;
        this.connectionFailed = true;
        throw error;
      }
    })();

    await this.connecting;
    this.connecting = null;
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    try {
      await this.connect();
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      console.log('[DB Query]', sql);
      const result = await this.db.query(sql, vars);
      return (result[0] || []) as T[];
    } catch (error) {
      console.error('[DB Query Error]', error);
      throw error;
    }
  }

  async select<T = any>(table: string): Promise<T[]> {
    try {
      await this.connect();
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      console.log('[DB Select]', table);
      const result = await this.db.select(table);
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
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      console.log('[DB Create]', table, data);
      const result = await this.db.create(table, data);
      console.log('[DB] ✓ Created successfully');
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Create Error]', table, error);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    try {
      await this.connect();
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      console.log('[DB Update]', thing, data);
      const result = await this.db.update(thing, data);
      console.log('[DB] ✓ Updated successfully');
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Update Error]', thing, error);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    try {
      await this.connect();
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      console.log('[DB Delete]', thing);
      await this.db.delete(thing);
      console.log('[DB] ✓ Deleted successfully');
    } catch (error) {
      console.error('[DB Delete Error]', thing, error);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    try {
      await this.connect();
      if (!this.db) {
        throw new Error('[DB] Not connected');
      }
      const thing = `${table}:${id}`;
      console.log('[DB Upsert]', thing, data);
      const result = await this.db.merge(thing, data);
      console.log('[DB] ✓ Upserted successfully');
      return (Array.isArray(result) ? result[0] : result) as T;
    } catch (error) {
      console.error('[DB Upsert Error]', table, id, error);
      throw error;
    }
  }
}

export const database = new Database();
