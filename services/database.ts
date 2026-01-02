import { Surreal } from 'surrealdb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_ENDPOINT = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
const DB_NAMESPACE = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
const DB_TOKEN = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

const isDatabaseConfigured = () => {
  const hasEndpoint = DB_ENDPOINT && DB_ENDPOINT.trim() !== '';
  const hasNamespace = DB_NAMESPACE && DB_NAMESPACE.trim() !== '';
  const hasToken = DB_TOKEN && DB_TOKEN.trim() !== '';
  return Boolean(hasEndpoint && hasNamespace && hasToken);
};

class Database {
  private db: Surreal | null = null;
  private connecting: Promise<void> | null = null;
  private useLocalStorage = !isDatabaseConfigured();

  constructor() {
    if (this.useLocalStorage) {
      console.log('[DB] Database not configured, using local storage fallback');
    }
  }

  async connect() {
    if (this.useLocalStorage) return;
    if (this.db) return;
    if (this.connecting) return this.connecting;

    if (!isDatabaseConfigured()) {
      console.log('[DB] Database credentials not configured, using local storage');
      this.useLocalStorage = true;
      return;
    }

    this.connecting = (async () => {
      try {
        console.log('[DB] Connecting to database...');
        this.db = new Surreal();
        
        await this.db.connect(DB_ENDPOINT!, {
          namespace: DB_NAMESPACE!,
          database: 'happy_art',
        });

        await this.db.authenticate(DB_TOKEN!);
        console.log('[DB] Connected successfully ✓');
      } catch (error) {
        console.error('[DB] Connection failed:', error);
        this.db = null;
        this.useLocalStorage = true;
        console.log('[DB] Falling back to local storage');
      }
    })();

    await this.connecting;
    this.connecting = null;
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    if (this.useLocalStorage) {
      return [];
    }
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
    if (this.useLocalStorage) {
      const stored = await AsyncStorage.getItem(`db_${table}`);
      return stored ? JSON.parse(stored) : [];
    }
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
    if (this.useLocalStorage) {
      const items = await this.select<T>(table);
      const newItem = { ...data, id: data.id || `${table}:${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
      items.push(newItem as T);
      await AsyncStorage.setItem(`db_${table}`, JSON.stringify(items));
      return newItem as T;
    }
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
    if (this.useLocalStorage) {
      const [table] = thing.split(':');
      const items = await this.select<any>(table);
      const index = items.findIndex((item: any) => item.id === thing);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        await AsyncStorage.setItem(`db_${table}`, JSON.stringify(items));
        return items[index] as T;
      }
      throw new Error(`Item ${thing} not found`);
    }
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
    if (this.useLocalStorage) {
      const [table] = thing.split(':');
      const items = await this.select<any>(table);
      const filtered = items.filter((item: any) => item.id !== thing);
      await AsyncStorage.setItem(`db_${table}`, JSON.stringify(filtered));
      return;
    }
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
    if (this.useLocalStorage) {
      const thing = `${table}:${id}`;
      const items = await this.select<any>(table);
      const index = items.findIndex((item: any) => item.id === thing);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        await AsyncStorage.setItem(`db_${table}`, JSON.stringify(items));
        return items[index] as T;
      } else {
        return this.create<T>(table, { ...data, id: thing });
      }
    }
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
