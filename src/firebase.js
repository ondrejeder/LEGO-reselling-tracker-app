import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDj3t-XA2zfKtxFpJker3km5lzVmR6GYgo",
  authDomain: "brick-invest-online.firebaseapp.com",
  projectId: "brick-invest-online",
  storageBucket: "brick-invest-online.firebaseapp.com",
  messagingSenderId: "79460859159",
  appId: "1:79460859159:web:cda5bd5f8ebf01f0e28b52",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
