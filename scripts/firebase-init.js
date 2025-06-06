// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7rsGu7wBjpN6mxzgs4EKmvSZ03o39qYA",
  authDomain: "loyaltea-app-c02c2.firebaseapp.com",
  projectId: "loyaltea-app-c02c2",
  storageBucket: "loyaltea-app-c02c2.firebasestorage.app",
  messagingSenderId: "159199586996",
  appId: "1:159199586996:web:e58164a9ffcd0a2d5f85e1",
  measurementId: "G-97EGB723N4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
