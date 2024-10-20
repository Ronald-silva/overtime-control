import { db } from './firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export const getDashboardData = async () => {
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);
  const inicioMesAtual = new Date(hojeInicio.getFullYear(), hojeInicio.getMonth(), 1);
  const fimMesAtual = new Date(hojeInicio.getFullYear(), hojeInicio.getMonth() + 1, 0, 23, 59, 59);

  const [
    horasExtrasMesAtual,
    horasExtrasPorMes,
    topFuncionarios,
    alertas
  ] = await Promise.all([
    calcularHorasExtrasPeriodo(inicioMesAtual, fimMesAtual),
    buscarHorasExtrasPorMes(),
    buscarTopFuncionarios(),
    gerarAlertas()
  ]);

  return {
    totalHorasExtrasMesAtual: horasExtrasMesAtual.totalHoras,
    custoTotalMesAtual: horasExtrasMesAtual.custoTotal,
    horasExtrasPorMes,
    topFuncionarios,
    alertas
  };
};

const calcularHorasExtrasPeriodo = async (dataInicio, dataFim) => {
  const registrosRef = collection(db, 'registros');
  const q = query(
    registrosRef,
    where('timestamp', '>=', Timestamp.fromDate(dataInicio)),
    where('timestamp', '<=', Timestamp.fromDate(dataFim))
  );

  const querySnapshot = await getDocs(q);
  let totalHoras = 0;
  let custoTotal = 0;

  querySnapshot.forEach((doc) => {
    const registro = doc.data();
    const horasExtras = calcularHorasExtras(registro);
    totalHoras += horasExtras;
    custoTotal += calcularCustoHorasExtras(horasExtras, registro.valorHora);
  });

  return { totalHoras, custoTotal };
};

const buscarHorasExtrasPorMes = async () => {
  const hoje = new Date();
  const mesesAnteriores = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    mesesAnteriores.push(data);
  }

  const resultados = await Promise.all(
    mesesAnteriores.map(async (data) => {
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);
      const { totalHoras } = await calcularHorasExtrasPeriodo(inicioMes, fimMes);
      return {
        mes: data.toLocaleString('default', { month: 'short' }),
        horas: totalHoras
      };
    })
  );

  return resultados;
};

const buscarTopFuncionarios = async () => {
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);
  const inicioMesAtual = new Date(hojeInicio.getFullYear(), hojeInicio.getMonth(), 1);

  const registrosRef = collection(db, 'registros');
  const q = query(
    registrosRef,
    where('timestamp', '>=', Timestamp.fromDate(inicioMesAtual)),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const funcionarios = {};

  querySnapshot.forEach((doc) => {
    const registro = doc.data();
    if (!funcionarios[registro.userCPF]) {
      funcionarios[registro.userCPF] = { nome: registro.nome, horasExtras: 0 };
    }
    funcionarios[registro.userCPF].horasExtras += calcularHorasExtras(registro);
  });

  return Object.values(funcionarios)
    .sort((a, b) => b.horasExtras - a.horasExtras)
    .slice(0, 5);
};

const gerarAlertas = async () => {
  const alertas = [];
  const limiteHorasExtras = 40; // Exemplo: limite de 40 horas extras por mês

  const topFuncionarios = await buscarTopFuncionarios();
  topFuncionarios.forEach(funcionario => {
    if (funcionario.horasExtras > limiteHorasExtras) {
      alertas.push(`${funcionario.nome} excedeu o limite de ${limiteHorasExtras} horas extras este mês.`);
    }
  });

  // Adicione mais lógica de alerta conforme necessário

  return alertas;
};

const calcularHorasExtras = (registro) => {
  // Implemente a lógica de cálculo de horas extras
  // Este é um exemplo simplificado
  const entrada = registro.timestamp.toDate();
  const saida = registro.timestampSaida ? registro.timestampSaida.toDate() : new Date();
  const horasTrabalhadas = (saida - entrada) / (1000 * 60 * 60);
  return Math.max(horasTrabalhadas - 8, 0); // Assumindo jornada de 8 horas
};

const calcularCustoHorasExtras = (horasExtras, valorHora) => {
  // Implemente a lógica de cálculo do custo das horas extras
  // Este é um exemplo simplificado
  return horasExtras * valorHora * 1.5; // Assumindo 50% de adicional
};

export default getDashboardData;