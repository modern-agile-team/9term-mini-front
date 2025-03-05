import { useState, useEffect, useRef } from 'react';
import apiClient from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const checkedAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (checkedAuth.current) return;
      checkedAuth.current = true;

      try {
        const response = await apiClient.get('api/users/me');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const logout = async () => {
    try {
      const response = await apiClient.post('api/logout');
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

  return { isAuthenticated, user, setUser, logout }; // ✅ setUser 추가
}

export default useAuth;
