// src/pages/Login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const [cpf, setCpf] = useState("");
  const [obra, setObra] = useState("");

  const handleLogin = async () => {
    try {
      const email = `${cpf}@example.com`;  // Usando o CPF como base para o email
      const password = "senha123";  // Senha padrão ou configurável
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Digite seu CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />
      <select value={obra} onChange={(e) => setObra(e.target.value)}>
        <option value="">Selecione a Obra</option>
        <option value="obra1">Obra 1</option>
        <option value="obra2">Obra 2</option>
      </select>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
