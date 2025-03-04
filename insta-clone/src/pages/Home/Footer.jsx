import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const Footer = () => {
  const { logout } = useAuth(); // ✅ 로그아웃 함수 가져오기
  const navigate = useNavigate();

  // ✅ 로그아웃 핸들러
  const handleLogout = async () => {
    await logout(); // 로그아웃 실행
    navigate('/login'); // 로그인 페이지로 이동
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
