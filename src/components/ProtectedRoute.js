import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isUserAuthenticated } from '../utils/firebase';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return children;
};

export default ProtectedRoute;