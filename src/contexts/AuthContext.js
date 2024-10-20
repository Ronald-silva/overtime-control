import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            // Criar documento do usuário se não existir
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              createdAt: new Date(),
            });
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('Error fetching/creating user data:', error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const setClaims = async (uid, isAdmin, isGestor) => {
    const functions = getFunctions();
    const setClaimsFunction = httpsCallable(functions, 'setClaims');
    
    try {
      await setClaimsFunction({ uid, claims: { admin: isAdmin, gestor: isGestor } });
      console.log('Claims definidas com sucesso');
    } catch (error) {
      console.error('Erro ao definir claims:', error);
      setError(error.message);
      throw error;
    }
  };

  const checkClaims = async () => {
    if (auth.currentUser) {
      const idTokenResult = await getIdTokenResult(auth.currentUser, true);
      return {
        isAdmin: !!idTokenResult.claims.admin,
        isGestor: !!idTokenResult.claims.gestor
      };
    }
    return { isAdmin: false, isGestor: false };
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setClaims,
    checkClaims
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}