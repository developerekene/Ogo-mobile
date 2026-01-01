// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCEv0nDm7DEnxPf-thc3SuEB478dSugS4M",
  authDomain: "ogoo-b9ce7.firebaseapp.com",
  projectId: "ogoo-b9ce7",
  storageBucket: "ogoo-b9ce7.firebasestorage.app",
  messagingSenderId: "12015187902",
  appId: "1:12015187902:web:0e2ca449666411fca12bef",
  measurementId: "G-S65819R5RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);