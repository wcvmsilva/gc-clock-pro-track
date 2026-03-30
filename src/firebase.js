import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmkFae7Ih2m8pEjVQW38IZAeOFDLrjr3U",
  authDomain: "gc-clock-pro-track.firebaseapp.com",
  projectId: "gc-clock-pro-track",
  storageBucket: "gc-clock-pro-track.firebasestorage.app",
  messagingSenderId: "512984415601",
  appId: "1:512984415601:web:868b91583b2aac0a6ecad0"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
export default app;
