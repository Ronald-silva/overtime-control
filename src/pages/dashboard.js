import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAuthEffect } from '../hooks/useAuthEffect';
import styles from '../styles/Dashboard.module.css';
import Clock from '../components/Clock';

const OBRAS = [
  { id: 'obra1', nome: 'Obra 1' },
  { id: 'obra2', nome: 'Obra 2' },
  { id: 'obra3', nome: 'Obra 3' },
];

export default function Dashboard() {
  const { user } = useAuth();
  useAuthEffect(); // Use o hook personalizado para proteção de rota

  const [userName, setUserName] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState(0);
  const [selectedObra, setSelectedObra] = useState('');
  const [jornada, setJornada] = useState('padrão');
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().nome);
      }
    }
  }, [user]);

  const fetchLastRecord = useCallback(async () => {
    if (!user) return;

    const registrosRef = collection(db, 'registros');
    const q = query(
      registrosRef,
      where('userCPF', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastRecord = querySnapshot.docs[0].data();
      setIsCheckedIn(lastRecord.tipo === 'entrada');
    }
  }, [user]);

  const fetchHorasTrabalhadas = useCallback(async () => {
    if (!user) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const registrosRef = collection(db, 'registros');
    const q = query(
      registrosRef,
      where('userCPF', '==', user.uid),
      where('timestamp', '>=', hoje),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let totalHoras = 0;
    let ultimaEntrada = null;

    querySnapshot.docs.reverse().forEach((doc) => {
      const registro = doc.data();
      if (registro.tipo === 'entrada') {
        ultimaEntrada = registro.timestamp.toDate();
      } else if (registro.tipo === 'saída' && ultimaEntrada) {
        const duracao = (registro.timestamp.toDate() - ultimaEntrada) / (1000 * 60 * 60);
        totalHoras += duracao;
        ultimaEntrada = null;
      }
    });

    setHorasTrabalhadas(totalHoras);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchLastRecord();
      fetchHorasTrabalhadas();
    }
  }, [user, fetchUserData, fetchLastRecord, fetchHorasTrabalhadas]);

  const registrarPonto = async (tipo) => {
    try {
      const registroRef = doc(collection(db, 'registros'));
      await setDoc(registroRef, {
        userCPF: user.uid,
        tipo,
        obra: selectedObra,
        jornada,
        timestamp: new Date()
      });
      setLastAction(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada com sucesso!`);
      setIsCheckedIn(tipo === 'entrada');
      fetchHorasTrabalhadas();
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      setLastAction('Erro ao registrar ponto. Tente novamente.');
    }
  };

  const handlePonto = useCallback(async (tipo) => {
    if (!selectedObra) {
      setLastAction('Por favor, selecione uma obra antes de registrar o ponto.');
      return;
    }

    setShowFacialRecognition(true);
    // Simular reconhecimento facial
    setTimeout(() => {
      setShowFacialRecognition(false);
      registrarPonto(tipo);
    }, 3000);
  }, [selectedObra, registrarPonto]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [router]);

  const handleVerHorasExtras = useCallback(() => {
    router.push('/horas-extras');
  }, [router]);

  if (!user) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Controle de Hora Extra</h1>
        <Clock />
      </header>
      
      <main className={styles.main}>
        <div className={styles.userInfo}>
          <h2 className={styles.welcome}>Bem-vindo, {userName}</h2>
          <p className={styles.horasInfo}>Horas trabalhadas hoje: {horasTrabalhadas.toFixed(2)} horas</p>
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.selectors}>
            <select 
              value={selectedObra} 
              onChange={(e) => setSelectedObra(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione uma obra</option>
              {OBRAS.map((obra) => (
                <option key={obra.id} value={obra.id}>{obra.nome}</option>
              ))}
            </select>

            <select 
              value={jornada} 
              onChange={(e) => setJornada(e.target.value)}
              className={styles.select}
            >
              <option value="padrão">Jornada Padrão</option>
              <option value="feriado">Feriado</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button 
              onClick={() => handlePonto('entrada')} 
              disabled={isCheckedIn}
              className={`${styles.button} ${styles.entradaButton}`}
            >
              Registrar Entrada
            </button>
            <button 
              onClick={() => handlePonto('saída')} 
              disabled={!isCheckedIn}
              className={`${styles.button} ${styles.saidaButton}`}
            >
              Registrar Saída
            </button>
          </div>

          {lastAction && <p className={styles.lastAction}>{lastAction}</p>}
        </div>

        <button onClick={handleVerHorasExtras} className={`${styles.button} ${styles.horasExtrasButton}`}>
          Ver Horas Extras (Últimos 30 dias)
        </button>

        <button onClick={handleLogout} className={`${styles.button} ${styles.logoutButton}`}>
          Sair
        </button>
      </main>

      {showFacialRecognition && (
        <div className={styles.facialRecognition}>
          <p>Realizando reconhecimento facial...</p>
        </div>
      )}
    </div>
  );
}