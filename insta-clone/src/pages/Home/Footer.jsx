import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const Footer = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true }); // ✅ 뒤로가기 방지
  };

  return (
    <footer className="fixed bottom-0 w-full max-w-[768px] h-14 bg-white border-t border-r border-gray-300 flex items-center justify-end px-4 mx-auto">
      <button
        onClick={handleLogout}
        className="flex items-center cursor-pointer"
      >
        <img src="/assets/icons/logout.svg" alt="logout" className="w-8 h-8" />
      </button>
    </footer>
  );
};

export default Footer;
