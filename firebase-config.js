// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYftjbGZSjuRpDdtTpqPRYXrd6y9OF3AI",
  authDomain: "easy-receipt1.firebaseapp.com",
  databaseURL: "https://easy-receipt1-default-rtdb.firebaseio.com",
  projectId: "easy-receipt1",
  storageBucket: "easy-receipt1.firebasestorage.app",
  messagingSenderId: "140939199464",
  appId: "1:140939199464:web:430ba9a47cecf782989a5d",
  measurementId: "G-17VSKS04HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
