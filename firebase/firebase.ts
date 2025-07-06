import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOPvF9gWAFZedSZZ3z-MgHmNB4yxGGlBo",
  authDomain: "sweepify-39929.firebaseapp.com",
  projectId: "sweepify-39929",
  storageBucket: "sweepify-39929.firebasestorage.app",
  messagingSenderId: "471105693797",
  appId: "1:471105693797:web:d7f4572e8d0dbaef663e8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }