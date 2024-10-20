import React from 'react';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuthEffect } from '../hooks/useAuthEffect';
import Navigation from '../components/Navigation';
import '../styles/globals.css';


function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuthEffect();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sistema de Controle de Horas Extras</title>
        <meta name="description" content="Sistema para gerenciamento de horas extras" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>

      {user && <Navigation />}
      
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <Component {...pageProps} user={user} />
      </main>

      <footer className="text-center py-4 mt-8 border-t bg-gray-100">
        <p>&copy; {new Date().getFullYear()} Sistema de Controle de Horas Extras. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}

export default MyApp;