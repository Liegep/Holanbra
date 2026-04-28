import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

// Hardcoded configuration as requested to prevent environment variable errors
const firebaseConfig = {
  apiKey: "AIzaSyC5mcwNnfJnhMHpjayfwtn8byn0mj86pqs",
  authDomain: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.firebaseapp.com",
  projectId: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e",
  storageBucket: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.appspot.com",
  messagingSenderId: "586275517087",
  appId: "1:586275517087:web:aded5d70fa0223a32328aa",
  firestoreDatabaseId: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

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

export const registerWithEmail = async (email: string, pass: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  
  // Create user profile in Firestore
  const adminEmails = ['hello@liegepaschoalini.design', 'slmariew@gmail.com', 'victoriaholanbra@gmail.com'];
  const role = adminEmails.map(e => e.toLowerCase()).includes(email.toLowerCase()) ? 'admin' : 'user';
  
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    uid: user.uid,
    role: role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return result;
};

// Connection test
async function testConnection() {
  try {
    const docRef = doc(db, 'test', 'connection');
    await getDocFromServer(docRef);
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    console.error("Firebase Connection Error:", error.code, error.message);
  }
}
testConnection();
