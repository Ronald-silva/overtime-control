import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Sistema de Controle de Horas Extras</title>
        <meta name="description" content="Sistema de Controle de Horas Extras" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
}