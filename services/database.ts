import AsyncStorage from '@react-native-async-storage/async-storage';

class Database {
  constructor() {
    console.log('[DB] AsyncStorage database service initialized');
  }

  private async getTable<T>(table: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(`table_${table}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`[DB] Error reading table ${table}:`, error);
      return [];
    }
  }

  private async setTable<T>(table: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`table_${table}`, JSON.stringify(data));
    } catch (error) {
      console.error(`[DB] Error writing table ${table}:`, error);
      throw error;
    }
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    console.warn('[DB] Query method not supported with AsyncStorage');
    return [];
  }

  async select<T = any>(table: string): Promise<T[]> {
    console.log('[DB Select]', table);
    return await this.getTable<T>(table);
  }

  async create<T = any>(table: string, data: any): Promise<T> {
    console.log('[DB Create]', table);
    const items = await this.getTable<any>(table);
    const id = data.id || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
    items.push(newItem);
    await this.setTable(table, items);
    console.log('[DB] ✓ Created successfully');
    return newItem as T;
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    console.log('[DB Update]', thing);
    const [table, id] = thing.split(':');
    const items = await this.getTable<any>(table);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      throw new Error(`[DB] Item ${thing} not found`);
    }
    
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    await this.setTable(table, items);
    console.log('[DB] ✓ Updated successfully');
    return items[index] as T;
  }

  async delete(thing: string): Promise<void> {
    console.log('[DB Delete]', thing);
    const [table, id] = thing.split(':');
    const items = await this.getTable<any>(table);
    const filtered = items.filter((item: any) => item.id !== id);
    await this.setTable(table, filtered);
    console.log('[DB] ✓ Deleted successfully');
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    console.log('[DB Upsert]', `${table}:${id}`);
    const items = await this.getTable<any>(table);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      const newItem = { ...data, id, createdAt: new Date().toISOString() };
      items.push(newItem);
      await this.setTable(table, items);
      console.log('[DB] ✓ Created successfully');
      return newItem as T;
    } else {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      await this.setTable(table, items);
      console.log('[DB] ✓ Updated successfully');
      return items[index] as T;
    }
  }
}

export const database = new Database();
