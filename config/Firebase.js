// config/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAOZ9iMqxSOuojdAl8JKA08hvtlh62vCOw",
  authDomain: "salaoapp-a4990.firebaseapp.com",
  projectId: "salaoapp-a4990",
  storageBucket: "salaoapp-a4990.appspot.com",
  messagingSenderId: "486749414346",
  appId: "1:486749414346:web:58acfe3feadbe277c76533",
  measurementId: "G-DFZBK31224"
};

const app = initializeApp(firebaseConfig);

// Inicializa auth com persistência
let auth;
if (Platform.OS === 'web') {
  // No web, usa persistência padrão do browser (localStorage)
  const { getAuth, browserLocalPersistence, setPersistence } = require('firebase/auth');
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(console.error);
} else {
  // No mobile, usa AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

export { auth, db };
