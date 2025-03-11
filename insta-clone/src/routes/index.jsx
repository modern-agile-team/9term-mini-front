import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from '@/pages/Home/Home';
import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';
import useAuth from '@/hooks/useAuth';

// 로딩 화면
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// 로그인한 사용자만 접근 가능 (Protected Route)
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 세션 스토리지나 로컬 스토리지에 사용자 정보가 있는지 확인
    const sessionUser = sessionStorage.getItem('sessionUser');
    const localUser = localStorage.getItem('user');

    if (sessionUser || localUser) {
      setIsChecking(false);
    } else {
      setIsChecking(false);
    }
  }, []);

  // 인증 상태 확인 중이면 로딩 화면 표시
  if (isChecking) {
    return <LoadingScreen />;
  }

  // 인증되지 않은 경우 로그인 페이지로 이동
  if (
    !isAuthenticated &&
    !sessionStorage.getItem('sessionUser') &&
    !localStorage.getItem('user')
  ) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
}

// 로그인/회원가입 페이지는 누구나 접근 가능하도록 수정
export default function AppRouter() {
  return (
    <Router>
      <AuthWrapper />
    </Router>
  );
}

// `Router` 내부에서 `useAuth` 실행
function AuthWrapper() {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 세션 스토리지나 로컬 스토리지에 사용자 정보가 있는지 확인
    const sessionUser = sessionStorage.getItem('sessionUser');
    const localUser = localStorage.getItem('user');

    if (sessionUser || localUser || isAuthenticated !== null) {
      setIsChecking(false);
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated]);

  // 로그인 이벤트 리스너 추가
  useEffect(() => {
    const handleLoginSuccess = () => {
      // 로그인 성공 시 홈으로 이동
      window.location.replace('/');
    };

    window.addEventListener('auth:loginSuccess', handleLoginSuccess);
    window.addEventListener('auth:login', handleLoginSuccess);

    return () => {
      window.removeEventListener('auth:loginSuccess', handleLoginSuccess);
      window.removeEventListener('auth:login', handleLoginSuccess);
    };
  }, []);

  // 인증 상태 확인 중이면 로딩 화면 표시
  if (isChecking) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* 로그인한 사용자만 홈에 접근 가능 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* 로그인/회원가입 페이지는 누구나 접근 가능 */}
      <Route
        path="/login"
        element={
          isAuthenticated ||
          sessionStorage.getItem('sessionUser') ||
          localStorage.getItem('user') ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/signup" element={<Signup />} />

      {/* 존재하지 않는 페이지는 `/` 또는 `/login`으로 이동 */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated ||
              sessionStorage.getItem('sessionUser') ||
              localStorage.getItem('user')
                ? '/'
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
}
