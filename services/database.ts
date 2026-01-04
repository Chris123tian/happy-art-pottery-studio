import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Firestore,
  onSnapshot,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
} from 'firebase/firestore';

class Database {
  private db: Firestore | null = null;
  private app: FirebaseApp | null = null;
  private isInitialized = false;

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
        console.log('[DB] Firebase initialized');
        
        this.db = initializeFirestore(this.app, {
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        });
        
        this.setupPersistence();
      } else {
        this.app = getApps()[0];
        this.db = getFirestore(this.app);
        console.log('[DB] Firebase already initialized');
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
    if (!this.db) return;

    try {
      await enableIndexedDbPersistence(this.db);
      console.log('[DB] Offline persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('[DB] Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('[DB] Persistence not available in this browser');
      } else {
        console.warn('[DB] Persistence setup failed:', err.message);
      }
    }

    try {
      await enableNetwork(this.db);
      console.log('[DB] Network enabled - online mode active');
    } catch (err: any) {
      console.error('[DB] Failed to enable network:', err.message);
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
      console.log('[DB] Forced online mode');
    } catch (err: any) {
      console.error('[DB] Failed to enable network:', err.message);
    }
  }

  async goOffline(): Promise<void> {
    if (!this.db) return;
    try {
      await disableNetwork(this.db);
      console.log('[DB] Offline mode enabled');
    } catch (err: any) {
      console.error('[DB] Failed to disable network:', err.message);
    }
  }

  async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    console.log('[DB Query]', sql);
    return [];
  }

  async select<T = any>(table: string): Promise<T[]> {
    try {
      this.ensureInitialized();
      console.log('[DB Select]', table);
      
      const colRef = collection(this.db!, table);
      const snapshot = await getDocs(colRef);
      
      const data: T[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      
      console.log(`[DB] ✓ Retrieved ${data.length} records from ${table}`);
      return data;
    } catch (error: any) {
      console.error('[DB Select Error]', table, error.message);
      return [];
    }
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

  async create<T = any>(table: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
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
      console.error('[DB Create Error]', table, error.message);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
      const [table, id] = thing.split(':');
      const docRef = doc(this.db!, table, id);
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      console.log(`[DB] ✓ Updated ${thing}`);
      return { id: updatedDoc.id, ...updatedDoc.data() } as T;
    } catch (error: any) {
      console.error('[DB Update Error]', thing, error.message);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    try {
      this.ensureInitialized();
      const [table, id] = thing.split(':');
      const docRef = doc(this.db!, table, id);
      
      await deleteDoc(docRef);
      console.log(`[DB] ✓ Deleted ${thing}`);
    } catch (error: any) {
      console.error('[DB Delete Error]', thing, error.message);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
      const docRef = doc(this.db!, table, id);
      const timestamp = new Date().toISOString();
      
      const existingDoc = await getDoc(docRef);
      const result = { 
        ...data, 
        id,
        createdAt: existingDoc.exists() ? existingDoc.data()?.createdAt : timestamp,
        updatedAt: timestamp
      };
      
      await setDoc(docRef, result, { merge: true });
      console.log(`[DB] ✓ Upserted ${table}:${id}`);
      return result as T;
    } catch (error: any) {
      console.error('[DB Upsert Error]', `${table}:${id}`, error.message);
      throw error;
    }
  }
}

export const database = new Database();
