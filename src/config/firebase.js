import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDX414-NF4s1dcA-hEDyGTX8CkZfXxnpc8",
  authDomain: "my-todo-app-95aff.firebaseapp.com",
  projectId: "my-todo-app-95aff",
  storageBucket: "my-todo-app-95aff.appspot.com",
  messagingSenderId: "497412028494",
  appId: "1:497412028494:web:944780efbb1ef4ed372b1f",
  measurementId: "G-KQCYSC9M5T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);