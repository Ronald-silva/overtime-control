import { getFunctions, httpsCallable } from 'firebase/functions';

export const setClaims = async (uid, isAdmin, isGestor) => {
  const functions = getFunctions();
  const setClaimsFunction = httpsCallable(functions, 'setClaims');
  
  try {
    await setClaimsFunction({ 
      uid, 
      claims: { admin: isAdmin, gestor: isGestor } 
    });
    console.log('Claims definidas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao definir claims:', error);
    throw error;
  }
};

// Outras funções relacionadas à autenticação podem ser adicionadas aqui