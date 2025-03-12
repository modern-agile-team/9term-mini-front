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
      // 쿠키 확인
      const hasCookie = document.cookie.includes('sessionUser=');

      const response = await apiClient.get('api/users/me', {
        throwHttpErrors: false,
      });

      // JSON 응답 바로 처리
      const jsonResponse = await response.json();

      if (jsonResponse.success && jsonResponse.data) {
        // 사용자 데이터 안전하게 추출
        let userData = null;

        // 데이터 구조 확인 및 안전하게 추출
        if (typeof jsonResponse.data === 'object') {
          if (jsonResponse.data.user) {
            userData = jsonResponse.data.user;
          } else if (
            Array.isArray(jsonResponse.data) &&
            jsonResponse.data.length > 0
          ) {
            userData = jsonResponse.data[0];
          } else {
            userData = jsonResponse.data;
          }
        } else {
          console.error(
            '[useAuth] 예상치 못한 데이터 형식:',
            jsonResponse.data
          );
          setUser(null);
          setIsAuthenticated(false);
          isCheckingRef.current = false;
          return;
        }

        // 사용자 데이터가 유효한지 확인
        if (!userData) {
          console.error(
            '[useAuth] 사용자 데이터가 없습니다:',
            jsonResponse.data
          );
          setUser(null);
          setIsAuthenticated(false);
          isCheckingRef.current = false;
          return;
        }

        // 필수 필드 확인
        if (!userData.email) {
          console.error('[useAuth] 사용자 이메일이 없습니다:', userData);
          // 이메일이 없어도 계속 진행 (임시 이메일 할당)
          userData.email = 'temp@example.com';
        }

        setUser(userData);
        setIsAuthenticated(true);

        // 현재 로그인 페이지에 있다면 홈으로 리디렉션
        if (window.location.pathname === '/login') {
          window.location.replace('/');
        }
      } else {
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

      // JSON 응답 바로 처리
      const jsonResponse = await response.json();

      if (jsonResponse.success && jsonResponse.data) {
        // 사용자 데이터 확인 및 안전하게 설정
        let userData = null;

        // 데이터 구조 확인 및 안전하게 추출
        if (typeof jsonResponse.data === 'object') {
          if (jsonResponse.data.user) {
            userData = jsonResponse.data.user;
          } else {
            userData = jsonResponse.data;
          }
        } else {
          console.error('예상치 못한 데이터 형식:', jsonResponse.data);
          throw new Error('서버 응답 형식 오류');
        }

        // 사용자 데이터가 유효한지 확인
        if (!userData) {
          console.error('사용자 데이터가 없습니다:', jsonResponse.data);
          throw new Error('유효하지 않은 사용자 데이터');
        }

        // 필수 필드 확인
        if (!userData.email) {
          console.error('사용자 이메일이 없습니다:', userData);
          // 이메일이 없어도 계속 진행 (임시 이메일 할당)
          userData.email = 'temp@example.com';
        }

        // 사용자 상태 즉시 업데이트
        setUser(userData);
        setIsAuthenticated(true);

        // 로그인 성공 후 사용자 정보 가져오기
        await checkAuth();

        // 로그인 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('auth:login', {
            detail: { user: userData },
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
