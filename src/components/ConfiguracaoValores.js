import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

const ConfiguracaoValores = () => {
  const [jornadaPadrao, setJornadaPadrao] = useState('');
  const [jornadaFeriado, setJornadaFeriado] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchValores = async () => {
      const docRef = doc(db, 'configuracoes', 'valores_hora');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setJornadaPadrao(data.jornadaPadrao.toString());
        setJornadaFeriado(data.jornadaFeriado.toString());
      }
      setLoading(false);
    };

    fetchValores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const docRef = doc(db, 'configuracoes', 'valores_hora');
      await updateDoc(docRef, {
        jornadaPadrao: parseFloat(jornadaPadrao),
        jornadaFeriado: parseFloat(jornadaFeriado),
        ultimaAtualizacao: Timestamp.now()
      });
      setMessage('Valores atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
      setMessage('Erro ao atualizar valores. Tente novamente.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h2>Configuração de Valores de Hora</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="jornadaPadrao">Valor Hora - Jornada Padrão:</label>
          <input
            type="number"
            id="jornadaPadrao"
            value={jornadaPadrao}
            onChange={(e) => setJornadaPadrao(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="jornadaFeriado">Valor Hora - Jornada Feriado:</label>
          <input
            type="number"
            id="jornadaFeriado"
            value={jornadaFeriado}
            onChange={(e) => setJornadaFeriado(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <button type="submit">Atualizar Valores</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ConfiguracaoValores;