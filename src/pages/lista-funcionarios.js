import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import styles from '../styles/ListaFuncionarios.module.css';

export default function ListaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      const querySnapshot = await getDocs(collection(db, 'funcionarios'));
      const funcionariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFuncionarios(funcionariosData);
    };

    fetchFuncionarios();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Lista de Funcionários</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map(funcionario => (
            <tr key={funcionario.id}>
              <td>{funcionario.nome}</td>
              <td>{funcionario.cpf}</td>
              <td>{funcionario.cargo}</td>
              <td>{funcionario.departamento}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}