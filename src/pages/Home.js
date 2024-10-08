// src/pages/Home.js
import { useState } from "react";
import { getAuth } from "firebase/auth";

function Home() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [saldoHorasExtras, setSaldoHorasExtras] = useState(0);

  const registrarEntrada = () => {
    console.log("Entrada registrada");
  };

  const registrarSaida = () => {
    console.log("Saída registrada");
  };

  return (
    <div>
      <h1>Bem-vindo, {user?.displayName || "Funcionário"}</h1>
      <h2>Hora Atual: {new Date().toLocaleTimeString()}</h2>
      <button onClick={registrarEntrada}>Registrar Entrada</button>
      <button onClick={registrarSaida}>Registrar Saída</button>
      <button onClick={() => setSaldoHorasExtras(5)}>Saldo de Horas Extras</button>
      <p>Saldo de Horas Extras: {saldoHorasExtras}</p>
    </div>
  );
}

export default Home;
