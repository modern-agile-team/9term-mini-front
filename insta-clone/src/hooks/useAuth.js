import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // 로딩 상태로 null 설정
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/api/users/me'); // 세션 인증 확인

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setIsAuthenticated(false);
        if (error.message.includes('401')) {
          navigate('/login'); // 인증 실패 시 로그인 페이지로 이동
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = async () => {
    try {
      const response = await apiClient.post('/api/logout'); // 로그아웃
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return { isAuthenticated, user, logout };
}

export default useAuth;
