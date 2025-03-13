// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{ getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyOHQrTQ_paCmaEkkm8PC4wg8Rb7o9F6E",
  authDomain: "inspire-wallet.firebaseapp.com",
  databaseURL: "https://inspire-wallet-default-rtdb.firebaseio.com",
  projectId: "inspire-wallet",
  storageBucket: "inspire-wallet.firebasestorage.app",
  messagingSenderId: "1091026046056",
  appId: "1:1091026046056:web:bd0fc54a12e57511cb3fdd",
  measurementId: "G-KJD1Q665JR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };