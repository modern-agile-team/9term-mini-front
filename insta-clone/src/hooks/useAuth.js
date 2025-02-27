import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // 초기값 null (로딩 중)
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/api/users/me'); // ✅ MSW와 실제 API 모두 대응
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
          navigate('/login'); // ✅ 인증 실패 시 로그인 페이지로 이동
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = async () => {
    try {
      const response = await apiClient.post('/api/logout'); // ✅ MSW와 실제 API 대응
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
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
