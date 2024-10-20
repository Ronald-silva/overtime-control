import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, login, checkClaims } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateCPF = (cpf) => {
    const cpfClean = cpf.replace(/[^\d]+/g, '');
    if (cpfClean.length !== 11 || !!cpfClean.match(/(\d)\1{10}/)) return false;
    const cpfArray = cpfClean.split('').map(el => +el);
    const rest = (count) => (cpfArray.slice(0, count-12)
        .reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10) % 11 % 10;
    return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
  };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateCPF(cpf)) {
      setError('CPF inválido. Por favor, verifique e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      const email = `${cpf}@empresa.com`; // Use o domínio que você configurou no Firebase
      await login(email, cpf);
      const claims = await checkClaims();
      console.log("Claims do usuário:", claims);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Falha no login. Verifique seu CPF e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [cpf, login, checkClaims, router]);

  const handleCPFChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCpf(value);
  }, []);

  const handleClearAuth = useCallback(async () => {
    try {
      await clearAuthentication();
      setError('Autenticação limpa. Você pode tentar fazer login novamente.');
    } catch (error) {
      console.error('Erro ao limpar autenticação:', error);
      setError('Falha ao limpar autenticação. Tente novamente.');
    }
  }, []);

  if (user) {
    return null; // ou um componente de carregamento, se preferir
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Sistema de Controle de Horas Extras</h1>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="cpf">CPF (apenas números)</label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={handleCPFChange}
              placeholder="Digite seu CPF (11 dígitos)"
              maxLength="11"
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading || cpf.length !== 11}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={handleClearAuth} className={styles.clearAuthButton}>
          Limpar Autenticação
        </button>
      </div>
    </div>
  );
}