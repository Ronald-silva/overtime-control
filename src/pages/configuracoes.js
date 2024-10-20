import React from 'react';
import ConfiguracaoValores from '../components/ConfiguracaoValores';
import { useAuth } from '../contexts/AuthContext';

const ConfiguracoesPage = () => {
  const { user } = useAuth();

  // Verifique se o usuário é um administrador
  if (!user || !user.isAdmin) {
    return <div>Acesso negado. Você não tem permissão para ver esta página.</div>;
  }

  return (
    <div>
      <h1>Configurações do Sistema</h1>
      <ConfiguracaoValores />
    </div>
  );
};

export default ConfiguracoesPage;