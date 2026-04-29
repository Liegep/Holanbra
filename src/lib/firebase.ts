import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Hardcoded configuration as requested
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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

export const registerWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);

// Connection test - removed Firestore test, Auth is sufficient
console.log("Firebase Auth initialized.");
