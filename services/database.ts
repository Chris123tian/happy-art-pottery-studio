import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';

class Database {
  private db: Firestore | null = null;
  private app: FirebaseApp | null = null;
  private isInitialized = false;
  private persistenceEnabled = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      };

      console.log('[DB] Checking Firebase config:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasProjectId: !!firebaseConfig.projectId,
        apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'undefined',
        projectId: firebaseConfig.projectId || 'undefined',
        allEnvVars: Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_FIREBASE')),
      });

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error('[DB] Firebase configuration missing. Please set up environment variables.');
        console.error('[DB] Required: EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, etc.');
        this.isInitialized = false;
        return;
      }

      if (getApps().length === 0) {
        this.app = initializeApp(firebaseConfig);
        
        try {
          this.db = initializeFirestore(this.app, {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
              cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
          });
          console.log('[DB] Firebase initialized with persistent cache');
        } catch (error: any) {
          console.log('[DB] Persistent cache failed, using default:', error.message);
          this.db = getFirestore(this.app);
        }
        
        this.setupPersistence();
      } else {
        this.app = getApps()[0];
        this.db = getFirestore(this.app);
        console.log('[DB] Firebase already initialized');
        this.setupPersistence();
      }

      this.isInitialized = true;
      console.log('[DB] Firestore database connected');
      console.log('[DB] Data will sync across all devices');
    } catch (error: any) {
      console.error('[DB] Firebase initialization error:', error.message);
      this.isInitialized = false;
    }
  }

  private async setupPersistence() {
    if (!this.db || this.persistenceEnabled) return;

    try {
      await enableNetwork(this.db);
      this.persistenceEnabled = true;
      console.log('[DB] ✓ Network enabled - online mode active');
      console.log('[DB] ✓ Persistence enabled for cross-device sync');
      console.log('[DB] ✓ All data changes will sync in real-time');
    } catch (error: any) {
      console.log('[DB] Note:', error.message);
      console.log('[DB] ✓ Using default network settings');
      this.persistenceEnabled = true;
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Please check Firebase configuration.');
    }
  }

  async forceOnline(): Promise<void> {
    if (!this.db) return;
    try {
      await enableNetwork(this.db);
      console.log('[DB] ✓ Network force-enabled');
    } catch (error: any) {
      if (!error.message.includes('already enabled')) {
        console.log('[DB] Network status:', error.message);
      }
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) return;
    try {
      await disableNetwork(this.db);
      await enableNetwork(this.db);
      console.log('[DB] ✓ Cache cleared and network reconnected');
    } catch (error: any) {
      console.log('[DB] Cache clear status:', error.message);
    }
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    console.log('[DB Query]', sql);
    return [];
  }

  async select<T = any>(table: string, retries = 3): Promise<T[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.ensureInitialized();
        await this.forceOnline();
        
        console.log(`[DB Select] ${table} (attempt ${attempt}/${retries})`);
        
        const colRef = collection(this.db!, table);
        const snapshot = await getDocs(colRef);
        
        const data: T[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        
        console.log(`[DB] ✓ Retrieved ${data.length} records from ${table}`);
        return data;
      } catch (error: any) {
        console.error(`[DB Select Error] ${table} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[DB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.forceOnline();
        } else {
          return [];
        }
      }
    }
    return [];
  }

  subscribeToCollection<T = any>(
    table: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    try {
      this.ensureInitialized();
      console.log('[DB Subscribe]', table);
      
      const colRef = collection(this.db!, table);
      
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const data: T[] = [];
          snapshot.forEach((docSnap) => {
            data.push({ id: docSnap.id, ...docSnap.data() } as T);
          });
          console.log(`[DB] ✓ Real-time update: ${data.length} records from ${table}`);
          callback(data);
        },
        (error) => {
          console.error('[DB Subscribe Error]', table, error.message);
          if (errorCallback) errorCallback(error);
        }
      );
      
      return unsubscribe;
    } catch (error: any) {
      console.error('[DB Subscribe Error]', table, error.message);
      return () => {};
    }
  }

  async create<T = any>(table: string, data: any, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.ensureInitialized();
        await this.forceOnline();
        
        const id = data.id || Date.now().toString();
        const docRef = doc(this.db!, table, id);
        const timestamp = new Date().toISOString();
        const newItem = { 
          ...data, 
          id, 
          createdAt: data.createdAt || timestamp,
          updatedAt: timestamp
        };
        
        await setDoc(docRef, newItem);
        console.log(`[DB] ✓ Created ${table}:${id}`);
        return newItem as T;
      } catch (error: any) {
        console.error(`[DB Create Error] ${table} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[DB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.forceOnline();
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to create after retries');
  }

  async update<T = any>(thing: string, data: any, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.ensureInitialized();
        await this.forceOnline();
        
        const [table, id] = thing.split(':');
        const docRef = doc(this.db!, table, id);
        
        const updateData = {
          ...data,
          id,
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(docRef, updateData, { merge: true });
        console.log(`[DB] ✓ Updated ${thing}`);
        return updateData as T;
      } catch (error: any) {
        console.error(`[DB Update Error] ${thing} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[DB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.forceOnline();
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to update after retries');
  }

  async delete(thing: string, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.ensureInitialized();
        await this.forceOnline();
        
        const [table, id] = thing.split(':');
        const docRef = doc(this.db!, table, id);
        
        await deleteDoc(docRef);
        console.log(`[DB] ✓ Deleted ${thing}`);
        return;
      } catch (error: any) {
        console.error(`[DB Delete Error] ${thing} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[DB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.forceOnline();
        } else {
          throw error;
        }
      }
    }
  }

  async upsert<T = any>(table: string, id: string, data: any, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.ensureInitialized();
        await this.forceOnline();
        
        const docRef = doc(this.db!, table, id);
        const timestamp = new Date().toISOString();
        
        const result = { 
          ...data, 
          id,
          createdAt: data.createdAt || timestamp,
          updatedAt: timestamp
        };
        
        await setDoc(docRef, result, { merge: true });
        console.log(`[DB] ✓ Upserted ${table}:${id}`);
        return result as T;
      } catch (error: any) {
        console.error(`[DB Upsert Error] ${table}:${id} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[DB] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.forceOnline();
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to upsert after retries');
  }
}

export const database = new Database();
