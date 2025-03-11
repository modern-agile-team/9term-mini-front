import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/apiClient';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    console.log('[useAuth] 인증 상태 확인 중...');

    try {
      // 쿠키 확인
      const hasCookie = document.cookie.includes('sessionUser=');
      console.log('[useAuth] 쿠키 확인:', hasCookie ? '있음' : '없음');

      if (hasCookie) {
        console.log('[useAuth] 쿠키 발견, 사용자 정보 요청 중...');
      }

      const response = await apiClient.get('api/users/me', {
        throwHttpErrors: false,
      });

      console.log('[useAuth] API 응답 상태:', response.status);

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('[useAuth] API 응답 데이터:', jsonResponse);

        if (jsonResponse.success && jsonResponse.data) {
          const userData = jsonResponse.data.user || jsonResponse.data[0];
          console.log('[useAuth] 사용자 정보 설정:', userData.email);
          setUser(userData);
          setIsAuthenticated(true);

          // 현재 로그인 페이지에 있다면 홈으로 리디렉션
          if (window.location.pathname === '/login') {
            console.log('[useAuth] 로그인 페이지에서 홈으로 리디렉션');
            window.location.replace('/');
          }
        } else {
          console.log('[useAuth] 인증 실패');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('[useAuth] 응답이 JSON이 아님');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[useAuth] 인증 확인 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  // 초기 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('[useAuth] 초기 마운트, 인증 상태 확인');

    // 쿠키 확인
    const hasCookie = document.cookie.includes('sessionUser=');
    console.log(
      '[useAuth] 초기 마운트 쿠키 확인:',
      hasCookie ? '있음' : '없음'
    );

    checkAuth();

    // 주기적으로 인증 상태 확인 (선택 사항)
    const interval = setInterval(() => {
      console.log('[useAuth] 주기적 인증 상태 확인');
      checkAuth();
    }, 30000); // 30초마다 확인

    return () => clearInterval(interval);
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
          console.log('로그인 API 응답 성공:', jsonResponse.data);

          // 사용자 상태 즉시 업데이트
          setUser(jsonResponse.data.user);
          setIsAuthenticated(true);

          // 로그인 성공 후 사용자 정보 가져오기
          await checkAuth();

          // 로그인 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('auth:login', {
              detail: { user: jsonResponse.data.user },
            })
          );

          // 현재 로그인 페이지에 있다면 홈으로 리디렉션
          if (window.location.pathname === '/login') {
            window.location.replace('/');
          }

          return true;
        } else {
          const errorMessage = jsonResponse.message || '로그인 실패';
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('서버 응답 형식 오류');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
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
