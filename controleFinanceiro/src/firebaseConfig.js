// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDFSfsG3OcsrDM7-Vc3tU6HsnqrsgoeCzo",
    authDomain: "controlefinanceiro-c6aed.firebaseapp.com",
    projectId: "controlefinanceiro-c6aed",
    storageBucket: "controlefinanceiro-c6aed.firebasestorage.app",
    messagingSenderId: "258099745426",
    appId: "1:258099745426:web:1002155607380ae0b30c4b"
  };
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
