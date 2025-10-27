import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import { user } from "./state.js";

// This check ensures the auth listener only runs in the browser, not in the Node.js test environment.
const isBrowser = typeof window !== 'undefined';
if (isBrowser) {
  // Listen for auth state changes
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      user.value = currentUser;
    } else {
      // Handle unauthenticated users, e.g., sign them in anonymously
      await signInAnonymously(auth);
    }
  });
}
