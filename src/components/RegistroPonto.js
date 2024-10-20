import { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../styles/RegistroPonto.module.css';

export default function RegistroPonto({ userId, obra }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const registrarPonto = async (tipo) => {
    setIsLoading(true);
    setMessage('');
    try {
      await addDoc(collection(db, 'registros'), {
        userId,
        obra,
        tipo,
        timestamp: serverTimestamp()
      });
      setMessage(`${tipo} registrado com sucesso!`);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      setMessage('Falha ao registrar ponto. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2>Registro de Ponto</h2>
      <button 
        onClick={() => registrarPonto('entrada')} 
        disabled={isLoading}
        className={styles.button}
      >
        Registrar Entrada
      </button>
      <button 
        onClick={() => registrarPonto('saida')} 
        disabled={isLoading}
        className={styles.button}
      >
        Registrar Saída
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}