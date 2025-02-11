import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full max-w-[768px] h-14 bg-white border-t border-r border-gray-300 flex items-center justify-end px-4 mx-auto">
      {/* 백엔드 : 로그아웃 시 사용자 세션을 만료 */}
      <Link to="/login" className="flex items-center cursor-pointer">
        <img src="/assets/icons/logout.svg" alt="logout" className="w-8 h-8" />
      </Link>
    </footer>
  );
};

export default Footer;
