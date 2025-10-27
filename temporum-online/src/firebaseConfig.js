// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// This check separates browser logic from Node.js logic.
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  // --- Browser environment ---
  // Connect to emulators only if we are running the app on localhost.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("Connecting to Firestore Emulator for browser at localhost:8080...");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Connecting to Functions Emulator for browser at localhost:5001...");
    connectFunctionsEmulator(functions, "localhost", 5001);
  }
} else if (process.env.FIRESTORE_EMULATOR_HOST) {
  // --- Node.js environment (Cloud Functions, tests) ---
  // Connect using the environment variable provided by the emulator suite.
  console.log(`Connecting to Firestore Emulator for Node.js at ${process.env.FIRESTORE_EMULATOR_HOST}...`);
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
  connectFirestoreEmulator(db, host, parseInt(port));
}

export { db, auth, functions };