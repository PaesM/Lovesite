import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAb2HCl1CXBWR2EMM0_2OJkPq1OefVb9Bk",
  authDomain: "love-site-for-kyle.firebaseapp.com",
  projectId: "love-site-for-kyle",
  storageBucket: "love-site-for-kyle.firebasestorage.app",
  messagingSenderId: "214876293562",
  appId: "1:214876293562:web:a18fbb1803737d4734b583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 EXPORT THESE (this is what you'll use in your app)
export const db = getFirestore(app);
export const storage = getStorage(app);