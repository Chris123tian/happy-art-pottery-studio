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
      } else {
        this.app = getApps()[0];
        console.log('[DB] Firebase already initialized');
      }

      this.db = getFirestore(this.app);
      this.isInitialized = true;
      console.log('[DB] Firestore database connected');
      console.log('[DB] Data will sync across all devices');
    } catch (error: any) {
      console.error('[DB] Firebase initialization error:', error.message);
      this.isInitialized = false;
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Please check Firebase configuration.');
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

  async create<T = any>(table: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
      console.log('[DB Create]', table);
      
      const id = data.id || Date.now().toString();
      const docRef = doc(this.db!, table, id);
      const newItem = { ...data, id };
      
      await setDoc(docRef, newItem);
      console.log('[DB] ✓ Created successfully');
      return newItem as T;
    } catch (error: any) {
      console.error('[DB Create Error]', table, error.message);
      throw error;
    }
  }

  async update<T = any>(thing: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
      console.log('[DB Update]', thing);
      
      const [table, id] = thing.split(':');
      const docRef = doc(this.db!, table, id);
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Item ${thing} not found`);
      }
      
      await updateDoc(docRef, data);
      
      const updatedDoc = await getDoc(docRef);
      console.log('[DB] ✓ Updated successfully');
      return { id: updatedDoc.id, ...updatedDoc.data() } as T;
    } catch (error: any) {
      console.error('[DB Update Error]', thing, error.message);
      throw error;
    }
  }

  async delete(thing: string): Promise<void> {
    try {
      this.ensureInitialized();
      console.log('[DB Delete]', thing);
      
      const [table, id] = thing.split(':');
      const docRef = doc(this.db!, table, id);
      
      await deleteDoc(docRef);
      console.log('[DB] ✓ Deleted successfully');
    } catch (error: any) {
      console.error('[DB Delete Error]', thing, error.message);
      throw error;
    }
  }

  async upsert<T = any>(table: string, id: string, data: any): Promise<T> {
    try {
      this.ensureInitialized();
      console.log('[DB Upsert]', `${table}:${id}`);
      
      const docRef = doc(this.db!, table, id);
      const result = { ...data, id };
      
      await setDoc(docRef, result, { merge: true });
      console.log('[DB] ✓ Upserted successfully');
      return result as T;
    } catch (error: any) {
      console.error('[DB Upsert Error]', `${table}:${id}`, error.message);
      throw error;
    }
  }
}

export const database = new Database();
