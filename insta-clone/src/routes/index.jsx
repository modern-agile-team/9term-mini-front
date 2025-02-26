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

function PrivateRoute({ element }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // ✅ API 응답 대기 중
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
