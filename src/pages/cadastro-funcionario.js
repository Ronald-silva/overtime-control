import { useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/CadastroFuncionario.module.css';

export default function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [salarioBase, setSalarioBase] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Criar usuário no Firebase Authentication
      const email = `${cpf}@empresa.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, cpf);

      // Adicionar dados do funcionário ao Firestore
      await addDoc(collection(db, 'funcionarios'), {
        nome,
        cpf,
        cargo,
        departamento,
        dataAdmissao,
        salarioBase: Number(salarioBase),
        uid: userCredential.user.uid,
      });

      alert('Funcionário cadastrado com sucesso!');
      router.push('/lista-funcionarios'); // Redirecionar para lista de funcionários
    } catch (error) {
      setError('Erro ao cadastrar funcionário: ' + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Cadastro de Funcionário</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
          required
        />
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="CPF"
          required
        />
        <input
          type="text"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          placeholder="Cargo"
          required
        />
        <input
          type="text"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          placeholder="Departamento"
          required
        />
        <input
          type="date"
          value={dataAdmissao}
          onChange={(e) => setDataAdmissao(e.target.value)}
          required
        />
        <input
          type="number"
          value={salarioBase}
          onChange={(e) => setSalarioBase(e.target.value)}
          placeholder="Salário Base"
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}