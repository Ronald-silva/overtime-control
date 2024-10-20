import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const publicRoutes = ['/login', '/register', '/forgot-password'];

export function useAuthEffect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const handleRouting = async () => {
      const isPublicRoute = publicRoutes.includes(router.pathname);

      if (!user && !isPublicRoute) {
        // Se não há usuário e a rota não é pública, redireciona para login
        await router.push('/login');
      } else if (user && isPublicRoute) {
        // Se há usuário e a rota é pública, redireciona para dashboard
        await router.push('/dashboard');
      }
    };

    handleRouting();
  }, [user, loading, router.pathname, router]);

  return { user, loading };
}