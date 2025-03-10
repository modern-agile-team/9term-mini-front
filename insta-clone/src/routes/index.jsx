import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Home from '@/pages/Home/Home';
import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';
import useAuth from '@/hooks/useAuth';

// ✅ 로딩 화면
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">로딩 중...</div>
);

// ✅ 로그인한 사용자만 접근 가능 (Protected Route)
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ✅ 로그인/회원가입 페이지는 누구나 접근 가능하도록 수정
export default function AppRouter() {
  return (
    <Router>
      <AuthWrapper />
    </Router>
  );
}

// ✅ `Router` 내부에서 `useAuth` 실행
function AuthWrapper() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <LoadingScreen />; // ✅ 로그인 여부 확인 후 로딩 화면
  }

  return (
    <Routes>
      {/* ✅ 로그인한 사용자만 홈에 접근 가능 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* ✅ 로그인/회원가입 페이지는 누구나 접근 가능 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ✅ 존재하지 않는 페이지는 `/` 또는 `/login`으로 이동 */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}
