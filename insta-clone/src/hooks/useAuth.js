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
    console.log('🔒 [useAuth] 인증 상태 확인 시작');

    try {
      const sessionUser = getSessionUser();

      if (sessionUser) {
        console.log('✅ [useAuth] 세션 사용자 발견:', sessionUser.email);
        setUser(sessionUser);
        setIsAuthenticated(true);
        isCheckingRef.current = false;
        return;
      }

      console.log('🔍 [useAuth] 세션 사용자 없음, API 요청');
      const response = await apiClient.get('api/users/me', {
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('🔒 [useAuth] 인증 응답:', jsonResponse);

        if (jsonResponse.success && jsonResponse.data) {
          const userData = jsonResponse.data.user || jsonResponse.data[0];
          console.log('✅ [useAuth] API 인증 성공:', userData);

          sessionStorage.setItem('sessionUser', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ [useAuth] API 인증 실패');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.error('❌ [useAuth] 응답이 JSON 형식이 아님:', contentType);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ [useAuth] 인증 확인 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, [getSessionUser]);

  // 초기 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('🔒 [useAuth] 초기 인증 상태 확인');

    // 세션 스토리지에서 사용자 정보 확인
    const sessionUser = getSessionUser();

    // 로컬 스토리지에서 사용자 정보 확인
    const localUser = localStorage.getItem('user');
    const parsedLocalUser = localUser ? JSON.parse(localUser) : null;

    if (sessionUser) {
      console.log(
        '✅ [useAuth] 세션 스토리지에서 사용자 발견:',
        sessionUser.email
      );
      setUser(sessionUser);
      setIsAuthenticated(true);
    } else if (parsedLocalUser) {
      console.log(
        '✅ [useAuth] 로컬 스토리지에서 사용자 발견:',
        parsedLocalUser.email
      );
      // 로컬 스토리지에 있는 사용자 정보를 세션 스토리지에 복원
      sessionStorage.setItem('sessionUser', JSON.stringify(parsedLocalUser));
      setUser(parsedLocalUser);
      setIsAuthenticated(true);
    } else {
      console.log('🔍 [useAuth] 저장된 사용자 정보 없음, API 요청');
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
      console.log('🔒 [useAuth] 로그인 시도:', email);

      const response = await apiClient.post('api/login', {
        json: { email, pwd },
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('🔒 [useAuth] 로그인 응답:', jsonResponse);

        if (jsonResponse.success && jsonResponse.data) {
          console.log('✅ [useAuth] 로그인 성공:', jsonResponse.data.user);

          // 세션 스토리지에 사용자 정보 저장
          sessionStorage.setItem(
            'sessionUser',
            JSON.stringify(jsonResponse.data.user)
          );

          // 상태 업데이트
          setUser(jsonResponse.data.user);
          setIsAuthenticated(true);

          // 로그인 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('auth:login', {
              detail: { user: jsonResponse.data.user },
            })
          );

          // 로컬 스토리지에도 저장 (새로고침 후에도 유지)
          localStorage.setItem('user', JSON.stringify(jsonResponse.data.user));

          return true;
        } else {
          const errorMessage = jsonResponse.message || '로그인 실패';
          console.error('❌ [useAuth] 로그인 실패:', errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        console.error('❌ [useAuth] 응답이 JSON 형식이 아님:', contentType);
        throw new Error('서버 응답 형식 오류');
      }
    } catch (error) {
      console.error('❌ [useAuth] 로그인 오류:', error);
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
