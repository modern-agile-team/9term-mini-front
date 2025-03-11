import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const Footer = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // useAuth의 logout 함수에서 리디렉션을 처리하므로 여기서는 제거
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
