import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from '../styles/Reports.module.css';

export default function Reports() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reports, setReports] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role !== 'manager') {
              router.push('/dashboard');
            } else {
              setUser(userData);
              await fetchEmployees();
            }
          } else {
            throw new Error('User not found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchEmployees = async () => {
    try {
      const employeesQuery = query(collection(db, 'users'), where('role', '==', 'employee'));
      const querySnapshot = await getDocs(employeesQuery);
      const employeeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        cpf: doc.data().cpf
      }));
      setEmployees(employeeList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchReports = async () => {
    if (!selectedEmployee || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);  // Set to end of day

    const registrosRef = collection(db, 'registros');
    const q = query(
      registrosRef,
      where('userCPF', '==', selectedEmployee),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      orderBy('timestamp', 'asc')
    );

    try {
      const querySnapshot = await getDocs(q);
      const registros = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      const reportData = processRegistros(registros);
      setReports(reportData.dailyReports);
      setTotalHours(reportData.totalHours);
      setTotalOvertime(reportData.totalOvertime);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
  };

  const processRegistros = (registros) => {
    let dailyReports = {};
    let totalHours = 0;
    let totalOvertime = 0;

    for (let i = 0; i < registros.length; i += 2) {
      const entrada = registros[i];
      const saida = registros[i + 1];

      if (entrada && saida) {
        const date = entrada.timestamp.toDateString();
        const horasTrabalhadas = (saida.timestamp - entrada.timestamp) / (1000 * 60 * 60);
        const horasExtras = Math.max(horasTrabalhadas - 8, 0);  // Assuming 8-hour workday

        if (!dailyReports[date]) {
          dailyReports[date] = { horasTrabalhadas: 0, horasExtras: 0 };
        }

        dailyReports[date].horasTrabalhadas += horasTrabalhadas;
        dailyReports[date].horasExtras += horasExtras;
        totalHours += horasTrabalhadas;
        totalOvertime += horasExtras;
      }
    }

    return { 
      dailyReports: Object.entries(dailyReports).map(([date, data]) => ({ date, ...data })),
      totalHours, 
      totalOvertime 
    };
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Relatórios de Horas</h1>
      <div className={styles.controls}>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className={styles.select}
        >
          <option value="">Selecione um funcionário</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.cpf}>{employee.nome}</option>
          ))}
        </select>
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
        <button onClick={fetchReports} className={styles.button}>Gerar Relatório</button>
      </div>
      {reports.length > 0 && (
        <div className={styles.reportContainer}>
          <h2>Resumo do Período</h2>
          <p>Total de Horas Trabalhadas: {totalHours.toFixed(2)}</p>
          <p>Total de Horas Extras: {totalOvertime.toFixed(2)}</p>
          <h3>Detalhes Diários</h3>
          <ul className={styles.reportList}>
            {reports.map((report) => (
              <li key={report.date} className={styles.reportItem}>
                <span>{new Date(report.date).toLocaleDateString()}</span>
                <span>Horas Trabalhadas: {report.horasTrabalhadas.toFixed(2)}</span>
                <span>Horas Extras: {report.horasExtras.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => router.push('/dashboard')} className={styles.button}>Voltar para o Dashboard</button>
    </div>
  );
}