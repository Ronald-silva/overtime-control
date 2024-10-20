import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gerarRelatorio, getValoresHora } from '../utils/relatorioUtils';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from '../styles/RelatorioGeral.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RelatorioGeral = () => {
  const { user } = useAuth();
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [valoresHora, setValoresHora] = useState({ jornadaPadrao: 0, jornadaFeriado: 0 });

  useEffect(() => {
    const fetchValoresHora = async () => {
      try {
        const valores = await getValoresHora();
        setValoresHora(valores);
      } catch (error) {
        console.error("Erro ao buscar valores de hora:", error);
        setError("Não foi possível carregar os valores de hora. Por favor, tente novamente mais tarde.");
      }
    };
    fetchValoresHora();
  }, []);

  const gerarRelatorioHandler = useCallback(async () => {
    if (!dataInicial || !dataFinal) {
      setError('Por favor, selecione um período para o relatório.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resultado = await gerarRelatorio(dataInicial, dataFinal, departamento, funcionarioId, valoresHora);
      setRelatorio(resultado);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setError('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [dataInicial, dataFinal, departamento, funcionarioId, valoresHora]);

  const exportarPDF = useCallback(() => {
    if (!relatorio) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório de Horas Extras', 14, 22);
    doc.setFontSize(12);
    doc.text(`Período: ${dataInicial} a ${dataFinal}`, 14, 30);
    
    if (departamento) {
      doc.text(`Departamento: ${departamento}`, 14, 38);
    }

    const tableColumn = ["Funcionário", "Horas Normais", "Horas Extras", "Valor Total"];
    const tableRows = relatorio.detalhes.map(item => [
      item.nome,
      item.horasNormais.toFixed(2),
      item.horasExtras.toFixed(2),
      `R$ ${item.valorTotal.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: departamento ? 46 : 38,
      head: [tableColumn],
      body: tableRows,
    });

    const finalY = doc.lastAutoTable.finalY || 46;
    doc.text(`Total de Horas Extras: ${relatorio.totalHorasExtras.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Custo Total: R$ ${relatorio.custoTotal.toFixed(2)}`, 14, finalY + 20);

    doc.save('relatorio-horas-extras.pdf');
  }, [relatorio, dataInicial, dataFinal, departamento]);

  const chartData = {
    labels: relatorio?.detalhes.map(item => item.nome) || [],
    datasets: [
      {
        label: 'Horas Extras',
        data: relatorio?.detalhes.map(item => item.horasExtras) || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição de Horas Extras por Funcionário',
      },
    },
  };

  if (!user || !user.isGestor) {
    return <div className={styles.error}>Acesso negado. Você não tem permissão para ver esta página.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Relatório Geral de Horas Extras</h1>
      <div className={styles.filtros}>
        <input
          type="date"
          value={dataInicial}
          onChange={(e) => setDataInicial(e.target.value)}
          className={styles.input}
        />
        <input
          type="date"
          value={dataFinal}
          onChange={(e) => setDataFinal(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          placeholder="Departamento"
          className={styles.input}
        />
        <input
          type="text"
          value={funcionarioId}
          onChange={(e) => setFuncionarioId(e.target.value)}
          placeholder="ID do Funcionário (opcional)"
          className={styles.input}
        />
        <button onClick={gerarRelatorioHandler} disabled={loading} className={styles.button}>
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {relatorio && (
        <div className={styles.resultados}>
          <h2 className={styles.subtitle}>Resultados do Relatório</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Horas Normais</th>
                <th>Horas Extras</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.detalhes.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.horasNormais.toFixed(2)}</td>
                  <td>{item.horasExtras.toFixed(2)}</td>
                  <td>R$ {item.valorTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.resumo}>
            <h3>Resumo</h3>
            <p>Total de Horas Extras: {relatorio.totalHorasExtras.toFixed(2)}</p>
            <p>Custo Total: R$ {relatorio.custoTotal.toFixed(2)}</p>
          </div>
          <div className={styles.grafico}>
            <Bar options={chartOptions} data={chartData} />
          </div>
          <button onClick={exportarPDF} className={styles.exportButton}>
            Exportar PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default RelatorioGeral;