// src/pages/CadastroFuncionario.js
import { useState } from "react";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

function CadastroFuncionario() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [foto, setFoto] = useState(null);

  const handleCadastro = async () => {
    if (!foto) {
      console.log("Selecione uma foto");
      return;
    }
    try {
      const fotoRef = ref(storage, `funcionarios/${cpf}.jpg`);
      await uploadBytes(fotoRef, foto);
      await setDoc(doc(db, "funcionarios", cpf), {
        nome: nome,
        cpf: cpf,
        fotoUrl: `funcionarios/${cpf}.jpg`,
      });
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
    }
  };

  return (
    <div>
      <h1>Cadastro de Funcionário</h1>
      <input
        type="text"
        placeholder="Nome do Funcionário"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        type="text"
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />
      <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
      <button onClick={handleCadastro}>Cadastrar Funcionário</button>
    </div>
  );
}

export default CadastroFuncionario;
