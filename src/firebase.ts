import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "checker-3b927.firebaseapp.com",
  projectId: "checker-3b927",
  storageBucket: "checker-3b927.firebasestorage.app",
  messagingSenderId: "865143320547",
  appId: "1:865143320547:web:6623c60d908ab4a6d53ad6",
  measurementId: "G-LTYH2JP21C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use them in your app
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;