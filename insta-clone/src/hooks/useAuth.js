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
      const sessionUser = getSessionUser();

      if (sessionUser) {
        setUser(sessionUser);
        setIsAuthenticated(true);
        return;
      }

      const response = await apiClient
        .get('api/users/me', { throwHttpErrors: false })
        .json();

      if (response.success && response.data) {
        const userData = response.data[0];
        sessionStorage.setItem('sessionUser', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
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

  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = event => {
      if (event.detail && user) {
        // 세션 스토리지에서 사용자 정보 업데이트
        const sessionUser = getSessionUser();
        if (sessionUser) {
          // profileImg가 null인 경우도 처리
          sessionUser.profileImg = event.detail.profileImg;
          sessionStorage.setItem('sessionUser', JSON.stringify(sessionUser));

          // 사용자 상태 즉시 업데이트
          setUser({ ...sessionUser });

          // 디버깅 로그
          console.log(
            '✅ [useAuth] 프로필 이미지 업데이트:',
            event.detail.profileImg
          );
        }
      }
    };

    window.addEventListener('profile:updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile:updated', handleProfileUpdate);
    };
  }, [user, getSessionUser]);

  // 저장소 변경 이벤트 리스너
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const login = async (email, pwd) => {
    try {
      const response = await apiClient
        .post('api/login', {
          json: { email, pwd },
          throwHttpErrors: false,
        })
        .json();

      if (response.success && response.data) {
        sessionStorage.setItem(
          'sessionUser',
          JSON.stringify(response.data.user)
        );

        setUser(response.data.user);
        setIsAuthenticated(true);

        window.dispatchEvent(
          new CustomEvent('auth:login', {
            detail: { user: response.data.user },
          })
        );

        return true;
      } else {
        const errorMessage = response.messages
          ? response.messages[0]
          : response.message || '로그인 실패';
        throw new Error(errorMessage);
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
      sessionStorage.removeItem('sessionUser');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return { isAuthenticated, user, setUser, login, logout };
}

export default useAuth;
