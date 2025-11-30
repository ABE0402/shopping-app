import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1OUYz7sQHybO1ApQovp1YlRpH5v0VXHM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shopping-app-ebaa6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shopping-app-ebaa6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shopping-app-ebaa6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "563498191716",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:563498191716:web:c6bd76a59ba28bc0f6c871"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 초기화
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

