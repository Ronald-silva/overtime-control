import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sistema de Controle de Horas Extras</title>
        <meta name="description" content="Sistema para controle de horas extras dos funcionários" />
      </Head>
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bem-vindo ao Sistema de Controle de Horas Extras</h1>
        <p className="text-lg text-gray-600 mb-8">Gerencie facilmente as horas extras da sua equipe.</p>
        <div className="space-x-4">
          <Link href="/login" legacyBehavior>
            <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login
            </a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Registrar
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}