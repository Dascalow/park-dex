import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCwDWkieEIx9rGnOWrgiMKuE2Hqywp_Uvw",
  authDomain: "park-dex-auth.firebaseapp.com",
  projectId: "park-dex-auth",
  storageBucket: "park-dex-auth.firebasestorage.app",
  messagingSenderId: "197085680308",
  appId: "1:197085680308:web:54a36d5c7b1f539dc4fde1"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);