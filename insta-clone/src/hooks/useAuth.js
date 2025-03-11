import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/apiClient';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const response = await apiClient.get('api/users/me', {
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.success && jsonResponse.data) {
          const userData = jsonResponse.data.user || jsonResponse.data[0];
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  // 초기 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = event => {
      if (event.detail && user) {
        // 사용자 상태 즉시 업데이트
        setUser(prevUser => ({
          ...prevUser,
          profileImg: event.detail.profileImg,
        }));
      }
    };

    window.addEventListener('profile:updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile:updated', handleProfileUpdate);
    };
  }, [user]);

  const login = async (email, pwd) => {
    try {
      const response = await apiClient.post('api/login', {
        json: { email, pwd },
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.success && jsonResponse.data) {
          // 로그인 성공 후 사용자 정보 가져오기
          await checkAuth();

          // 로그인 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('auth:login', {
              detail: { user: jsonResponse.data.user },
            })
          );

          return true;
        } else {
          const errorMessage = jsonResponse.message || '로그인 실패';
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('서버 응답 형식 오류');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('api/logout');
      setUser(null);
      setIsAuthenticated(false);

      // 로그아웃 후 로그인 페이지로 리디렉션
      window.location.href = '/login';
    } catch (error) {
      // 오류가 발생해도 로컬에서는 로그아웃 처리
      setUser(null);
      setIsAuthenticated(false);

      // 오류가 발생해도 로그인 페이지로 리디렉션
      window.location.href = '/login';
    }
  };

  return { isAuthenticated, user, setUser, login, logout, checkAuth };
}

export default useAuth;
