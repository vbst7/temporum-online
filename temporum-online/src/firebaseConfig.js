// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB05tIpEG2YYZhCQWO8wNY2054xH0CRVGs",
  authDomain: "temporum-online.firebaseapp.com",
  projectId: "temporum-online",
  storageBucket: "temporum-online.firebasestorage.app",
  messagingSenderId: "132770057733",
  appId: "1:132770057733:web:33cdbf7afc8126180ed66c"

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