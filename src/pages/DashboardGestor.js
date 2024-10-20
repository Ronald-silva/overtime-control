import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardData } from '../utils/dashboardUtils';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/DashboardGestor.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardGestor = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user || !user.isGestor) {
    return <div className={styles.error}>Acesso negado. Você não tem permissão para ver esta página.</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const lineChartData = {
    labels: dashboardData.horasExtrasPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Horas Extras',
        data: dashboardData.horasExtrasPorMes.map(item => item.horas),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const barChartData = {
    labels: dashboardData.topFuncionarios.map(func => func.nome),
    datasets: [
      {
        label: 'Horas Extras',
        data: dashboardData.topFuncionarios.map(func => func.horasExtras),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard de Horas Extras</h1>
      
      <div className={styles.summary}>
        <div className={styles.card}>
          <h3>Total de Horas Extras (Mês Atual)</h3>
          <p className={styles.bigNumber}>{dashboardData.totalHorasExtrasMesAtual.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h3>Custo Total (Mês Atual)</h3>
          <p className={styles.bigNumber}>R$ {dashboardData.custoTotalMesAtual.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chart}>
          <h3>Horas Extras por Mês</h3>
          <Line data={lineChartData} />
        </div>
        <div className={styles.chart}>
          <h3>Top 5 Funcionários (Horas Extras)</h3>
          <Bar data={barChartData} />
        </div>
      </div>

      <div className={styles.alerts}>
        <h3>Alertas</h3>
        <ul>
          {dashboardData.alertas.map((alerta, index) => (
            <li key={index} className={styles.alert}>{alerta}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardGestor;