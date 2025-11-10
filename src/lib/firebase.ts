// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged, 
  User,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeXN1CLScyWKWW8rpwVBe-zLkAPxelwso",
  authDomain: "oltech-ai-3c1c4.firebaseapp.com",
  projectId: "oltech-ai-3c1c4",
  storageBucket: "oltech-ai-3c1c4.firebasestorage.app",
  messagingSenderId: "175941768154",
  appId: "1:175941768154:web:d9935727e8b1710ebd66e3",
  measurementId: "G-QP0B5GJBCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const createUser = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  return await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;