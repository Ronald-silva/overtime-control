import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../utils/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import styles from '../styles/HorasExtras.module.css';

export default function HorasExtras() {
  const [horasExtras, setHorasExtras] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    fetchHorasExtras(thirtyDaysAgo, new Date());
  }, []);

  const fetchHorasExtras = async (start, end) => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const userCPF = localStorage.getItem('userCPF');
    if (!userCPF) {
      console.error('CPF do usuário não encontrado');
      setLoading(false);
      return;
    }

    const registrosRef = collection(db, 'registros');
    const q = query(
      registrosRef,
      where('userCPF', '==', userCPF),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      orderBy('timestamp', 'desc')
    );

    try {
      const querySnapshot = await getDocs(q);
      let totalHorasExtras = 0;
      const registrosData = [];

      querySnapshot.forEach((doc) => {
        const registro = doc.data();
        registrosData.push({
          id: doc.id,
          ...registro,
          timestamp: registro.timestamp.toDate()
        });
      });

      // Cálculo de horas extras (assumindo jornada de 8 horas)
      for (let i = 0; i < registrosData.length; i += 2) {
        if (i + 1 < registrosData.length) {
          const entrada = registrosData[i + 1].timestamp;
          const saida = registrosData[i].timestamp;
          const horasTrabalhadas = (saida - entrada) / (1000 * 60 * 60);
          if (horasTrabalhadas > 8) {
            totalHorasExtras += horasTrabalhadas - 8;
          }
        }
      }

      setHorasExtras(totalHorasExtras);
      setRegistros(registrosData);
    } catch (error) {
      console.error('Erro ao buscar horas extras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);  // Set to end of day
    fetchHorasExtras(start, end);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Horas Extras</h1>
      <div className={styles.filterContainer}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
        />
        <button onClick={handleFilter} className={styles.filterButton}>Filtrar</button>
      </div>
      <div className={styles.totalHoras}>
        Total de Horas Extras: {horasExtras.toFixed(2)} horas
      </div>
      <div className={styles.registrosContainer}>
        {registros.map((registro) => (
          <div key={registro.id} className={styles.registroItem}>
            <div className={styles.registroData}>{formatDate(registro.timestamp)}</div>
            <div className={styles.registroHora}>{formatTime(registro.timestamp)}</div>
            <div className={styles.registroTipo}>{registro.tipo}</div>
            <div className={styles.registroObra}>{registro.obra}</div>
          </div>
        ))}
      </div>
      <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
        Voltar para o Dashboard
      </button>
    </div>
  );
}