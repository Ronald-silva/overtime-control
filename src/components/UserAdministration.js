import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function UserAdministration() {
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGestor, setIsGestor] = useState(false);

  const setClaims = async () => {
    const functions = getFunctions();
    const setClaimsFunction = httpsCallable(functions, 'setClaims');
    
    try {
      await setClaimsFunction({ 
        uid: userId, 
        claims: { admin: isAdmin, gestor: isGestor } 
      });
      alert('Claims definidas com sucesso');
    } catch (error) {
      console.error('Erro ao definir claims:', error);
      alert('Erro ao definir claims: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Administração de Usuários</h2>
      <input 
        type="text" 
        value={userId} 
        onChange={(e) => setUserId(e.target.value)} 
        placeholder="ID do Usuário"
      />
      <label>
        <input 
          type="checkbox" 
          checked={isAdmin} 
          onChange={(e) => setIsAdmin(e.target.checked)} 
        /> Admin
      </label>
      <label>
        <input 
          type="checkbox" 
          checked={isGestor} 
          onChange={(e) => setIsGestor(e.target.checked)} 
        /> Gestor
      </label>
      <button onClick={setClaims}>Definir Claims</button>
    </div>
  );
}

export default UserAdministration;