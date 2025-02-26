import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('api/users/me').json();
        setUser(response);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await apiClient.post('api/logout');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login'); // ✅ 로그아웃 후 로그인 페이지로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return { isAuthenticated, user, logout };
}
export default useAuth;
