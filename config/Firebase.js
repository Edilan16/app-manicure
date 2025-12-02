// config/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOZ9iMqxSOuojdAl8JKA08hvtlh62vCOw",
  authDomain: "salaoapp-a4990.firebaseapp.com",
  projectId: "salaoapp-a4990",
  storageBucket: "salaoapp-a4990.firebasestorage.app",
  messagingSenderId: "486749414346",
  appId: "1:486749414346:web:58acfe3feadbe277c76533",
  measurementId: "G-DFZBK31224"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db };
