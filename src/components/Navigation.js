import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho conforme necessário

const Navigation = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (pathname) => router.pathname === pathname;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex justify-between items-center">
        <div className="flex space-x-4">
          <li>
            <Link href="/dashboard" className={`hover:text-gray-300 ${isActive('/dashboard') ? 'font-bold' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/horas-extras" className={`hover:text-gray-300 ${isActive('/horas-extras') ? 'font-bold' : ''}`}>
              Horas Extras
            </Link>
          </li>
          <li>
            <Link href="/relatorio-horas-extras" className={`hover:text-gray-300 ${isActive('/relatorio-horas-extras') ? 'font-bold' : ''}`}>
              Relatório de Horas Extras
            </Link>
          </li>
          <li>
            <Link href="/configuracoes">Configurações</Link>
          </li>

        </div>
        <li>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            aria-label="Sair do sistema"
          >
            Sair
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;