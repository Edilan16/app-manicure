// config/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
// Inicializa auth sem persistence customizada (usa padrão do Firebase)
const auth = initializeAuth(app);
const db = getFirestore(app);

export { auth, db };
