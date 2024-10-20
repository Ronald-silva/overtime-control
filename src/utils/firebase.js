import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebaseApp;
let auth;
let db;
let storage;
let functions;

if (typeof window !== 'undefined') {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  functions = getFunctions(firebaseApp);
}

export const authenticateWithCPF = async (cpf) => {
  if (typeof window === 'undefined') {
    throw new Error('Esta função só pode ser chamada no lado do cliente');
  }
  try {
    const email = `${cpf}@empresa.com`;
    const userCredential = await signInWithEmailAndPassword(auth, email, cpf);
    console.log("Autenticação bem-sucedida:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Erro na autenticação:", error);
    throw error;
  }
};

export const isUserAuthenticated = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

export const clearAuthentication = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Esta função só pode ser chamada no lado do cliente');
  }
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    console.log("Autenticação limpa com sucesso");
  } catch (error) {
    console.error("Erro ao limpar autenticação:", error);
    throw error; // Propagar o erro para tratamento no componente
  }
};

export { auth, db, storage, functions };