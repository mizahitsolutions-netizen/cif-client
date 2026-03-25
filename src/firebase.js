import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBdkAWbnh_sEhRNcSZPu0OloXPn92TPAoI",
  authDomain: "crumbella.firebaseapp.com",
  projectId: "crumbella",
  storageBucket: "crumbella.appspot.com",
  messagingSenderId: "339388261018",
  appId: "1:339388261018:web:d67d9a6f43af4906f4b523",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");
