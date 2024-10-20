import { db } from './firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export const getValoresHora = async () => {
  const docRef = doc(db, 'configuracoes', 'valores_hora');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  throw new Error('Configurações de valores não encontradas');
};

export const gerarRelatorio = async (dataInicial, dataFinal, departamento, funcionarioId, valoresHora) => {
  const registrosRef = collection(db, 'registros');
  let q = query(
    registrosRef,
    where('timestamp', '>=', Timestamp.fromDate(new Date(dataInicial))),
    where('timestamp', '<=', Timestamp.fromDate(new Date(dataFinal)))
  );

  if (departamento) {
    q = query(q, where('departamento', '==', departamento));
  }

  if (funcionarioId) {
    q = query(q, where('userCPF', '==', funcionarioId));
  }

  const querySnapshot = await getDocs(q);
  const registros = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return processarRegistros(registros, valoresHora);
};

const processarRegistros = (registros, valoresHora) => {
  const funcionarios = {};
  let totalHorasExtras = 0;
  let custoTotal = 0;

  registros.forEach(registro => {
    if (!funcionarios[registro.userCPF]) {
      funcionarios[registro.userCPF] = {
        nome: registro.nome,
        horasNormais: 0,
        horasExtras: 0,
        valorTotal: 0
      };
    }

    const func = funcionarios[registro.userCPF];
    const horasTrabalhadas = calcularHorasTrabalhadas(registro);
    const { horasNormais, horasExtras } = classificarHoras(horasTrabalhadas);

    func.horasNormais += horasNormais;
    func.horasExtras += horasExtras;

    const valorHorasNormais = horasNormais * valoresHora.jornadaPadrao;
    const valorHorasExtras = horasExtras * (registro.jornada === 'feriado' ? valoresHora.jornadaFeriado : valoresHora.jornadaPadrao * 1.5);

    func.valorTotal += valorHorasNormais + valorHorasExtras;

    totalHorasExtras += horasExtras;
    custoTotal += valorHorasNormais + valorHorasExtras;
  });

  return {
    detalhes: Object.values(funcionarios),
    totalHorasExtras,
    custoTotal
  };
};

const calcularHorasTrabalhadas = (registro) => {
  const entrada = registro.timestamp.toDate();
  const saida = registro.timestampSaida ? registro.timestampSaida.toDate() : new Date();
  return (saida - entrada) / (1000 * 60 * 60); // Converte para horas
};

const classificarHoras = (horasTrabalhadas) => {
  const horasNormais = Math.min(horasTrabalhadas, 8); // Considerando jornada de 8 horas
  const horasExtras = Math.max(horasTrabalhadas - 8, 0);
  return { horasNormais, horasExtras };
};