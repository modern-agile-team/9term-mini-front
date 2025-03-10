import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/apiClient';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const isCheckingRef = useRef(false);

  const getSessionUser = useCallback(() => {
    const sessionUser = sessionStorage.getItem('sessionUser');
    return sessionUser && sessionUser !== 'undefined'
      ? JSON.parse(sessionUser)
      : null;
  }, []);

  const checkAuth = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      console.log('🔍 인증 상태 확인 중...');
      const sessionUser = getSessionUser();

      if (sessionUser) {
        console.log('✅ 세션에서 사용자 정보 확인됨:', sessionUser);
        setUser(sessionUser);
        setIsAuthenticated(true);
        return;
      }

      const response = await apiClient
        .get('api/users/me', { throwHttpErrors: false })
        .json();

      if (response.success && response.data) {
        console.log('✅ 서버에서 사용자 정보 업데이트됨:', response.data[0]);
        const userData = response.data[0];
        sessionStorage.setItem('sessionUser', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, [getSessionUser]);

  // 초기 마운트 시 인증 상태 확인
  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setUser(sessionUser);
      setIsAuthenticated(true);
    } else {
      checkAuth();
    }
  }, [getSessionUser, checkAuth]);

  // 저장소 변경 이벤트 리스너
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 세션 스토리지 변경 감지됨');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const login = async (email, pwd) => {
    try {
      console.log('📤 로그인 요청 전송:', { email, pwd });
      const response = await apiClient
        .post('api/login', {
          json: { email, pwd },
          throwHttpErrors: false, // 401 에러가 발생해도 예외를 던지지 않도록 설정
        })
        .json();

      console.log('📥 로그인 응답 수신:', response);

      if (response.success && response.data) {
        console.log('✅ 로그인 성공:', response.data.user);
        sessionStorage.setItem(
          'sessionUser',
          JSON.stringify(response.data.user)
        );

        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        const errorMessage = response.messages
          ? response.messages[0]
          : response.message || '로그인 실패';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('api/logout');
      sessionStorage.removeItem('sessionUser');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  return { isAuthenticated, user, setUser, login, logout };
}

export default useAuth;
