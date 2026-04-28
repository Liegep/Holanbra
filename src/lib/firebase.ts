import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Helper to get config from environment or fallback to imported file
const getFirebaseConfig = () => {
  const env = (import.meta as any).env;
  console.log("Environment check - API Key present:", !!env.VITE_FIREBASE_API_KEY);
  
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_API_KEY.length > 10) {
    // Sanitize common typos in manual entry
    let key = env.VITE_FIREBASE_API_KEY.trim();
    if (key.toLowerCase().startsWith('alza')) {
       console.log("Fixing API Key prefix typo (l vs I)");
       key = 'AIza' + key.slice(4);
    }
    
    const config = {
      apiKey: key,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || firebaseConfig.authDomain,
      projectId: (env.VITE_FIREBASE_PROJECT_ID?.trim() && !env.VITE_FIREBASE_PROJECT_ID.startsWith('gen-lang')) 
        ? env.VITE_FIREBASE_PROJECT_ID.trim() 
        : "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e",
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || firebaseConfig.storageBucket,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || firebaseConfig.messagingSenderId,
      appId: env.VITE_FIREBASE_APP_ID?.trim() || firebaseConfig.appId,
      firestoreDatabaseId: (env.VITE_FIREBASE_DATABASE_ID?.trim()) || firebaseConfig.firestoreDatabaseId
    };
    
    // Safety check for authDomain and storageBucket fallback
    if (config.authDomain.startsWith('gen-lang')) {
      config.authDomain = `${config.projectId}.firebaseapp.com`;
    }
    if (config.storageBucket.startsWith('gen-lang')) {
      config.storageBucket = `${config.projectId}.firebasestorage.app`;
    }
    console.log("Firebase Config (from env):", { ...config, apiKey: '***' + config.apiKey.slice(-4) });
    return config;
  }
  console.log("Firebase Config (from file):", { ...firebaseConfig, apiKey: '***' + firebaseConfig.apiKey.slice(-4) });
  return firebaseConfig;
};

const finalConfig = getFirebaseConfig();
const app = initializeApp(finalConfig);

// If firestoreDatabaseId is provided, use it. Otherwise defaults to (default)
const dbId = (finalConfig as any).firestoreDatabaseId || '(default)';
console.log("Initializing Firestore with Database ID:", dbId);
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

// Connection test
async function testConnection() {
  try {
    const docRef = doc(db, 'test', 'connection');
    await getDocFromServer(docRef);
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    console.error("Firebase Connection Error:", error.code, error.message);
    if (error.message.includes('the client is offline')) {
      console.error("SDK reports offline. This often means the project/database ID is incorrect or mismatch with rules.");
    }
  }
}
testConnection();
