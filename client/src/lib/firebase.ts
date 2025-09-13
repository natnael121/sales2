import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { FirebaseConfig } from "../types";

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2bS6HoDzojroZJ3frN3BbAY_K8VSUhSU",
  authDomain: "sales-app-97827.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sales-app-97827",
  storageBucket: "sales-app-97827.firebasestorage.app",
  messagingSenderId: "73800188659",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:73800188659:web:4fc733e3f5415c2b68ad86",
  measurementId: "G-76W3SNVQPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
