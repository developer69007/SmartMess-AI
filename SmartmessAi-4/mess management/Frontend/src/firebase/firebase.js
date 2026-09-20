import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyCMcwJ-ApBEVuN5xe4NHLMOKdDooy1qyqw",
  authDomain: "smartmess-ai-e6f72.firebaseapp.com",
  projectId: "smartmess-ai-e6f72",
  storageBucket: "smartmess-ai-e6f72.firebasestorage.app",
  messagingSenderId: "786010340885",
  appId: "1:786010340885:web:943d3e81e688b945d8d81c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);