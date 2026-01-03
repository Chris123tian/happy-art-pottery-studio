import AsyncStorage from '@react-native-async-storage/async-storage';

class Database {
  constructor() {
    console.log('[DB] AsyncStorage database service initialized');
  }

  private getKey(table: string): string {
    return `@db:${table}`;
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    console.log('[DB Query]', sql);
    return [];
  }

  async select<T = any>(table: string): Promise<T[]> {
    try {
      console.log('[DB Select]', table);
      const key = this.getKey(table);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error: any) {
      console.error('[DB Select Error]', table, error);
      return [];
    }
  }

  async create<T = any>(table: string, data: any): Promise<T> {
    try {
      console.log('[DB Create]', table);
      const key = this.getKey(table);
      const existing = await this.select<T>(table);
      const newItem = { ...data, id: data.id || Date.now().toString() };
      const updated = [...existing, newItem];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      console.log('[DB] ✓ Created successfully');
      return newItem as T;
    } catch (error: any) {
      console.error('[DB Create Error]', table, error);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    try {
      console.log('[DB Update]', thing);
      const [table, id] = thing.split(':');
      const key = this.getKey(table);
      const existing = await this.select<any>(table);
      const index = existing.findIndex((item: any) => item.id === id);
      
      if (index !== -1) {
        existing[index] = { ...existing[index], ...data };
        await AsyncStorage.setItem(key, JSON.stringify(existing));
        console.log('[DB] ✓ Updated successfully');
        return existing[index] as T;
      }
      
      throw new Error(`Item ${thing} not found`);
    } catch (error: any) {
      console.error('[DB Update Error]', thing, error);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    try {
      console.log('[DB Delete]', thing);
      const [table, id] = thing.split(':');
      const key = this.getKey(table);
      const existing = await this.select<any>(table);
      const filtered = existing.filter((item: any) => item.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      console.log('[DB] ✓ Deleted successfully');
    } catch (error: any) {
      console.error('[DB Delete Error]', thing, error);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    try {
      console.log('[DB Upsert]', `${table}:${id}`);
      const key = this.getKey(table);
      const existing = await this.select<any>(table);
      const index = existing.findIndex((item: any) => item.id === id);
      
      let result: any;
      if (index !== -1) {
        existing[index] = { ...existing[index], ...data, id };
        result = existing[index];
      } else {
        result = { ...data, id };
        existing.push(result);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(existing));
      console.log('[DB] ✓ Created successfully');
      return result as T;
    } catch (error: any) {
      console.error('[DB Upsert Error]', `${table}:${id}`, error);
      throw error;
    }
  }
}

export const database = new Database();
