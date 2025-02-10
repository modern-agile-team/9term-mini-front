import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <footer className="fixed bottom-0 w-full max-w-[768px] h-14 bg-white border-t border-r border-gray-300 flex items-center justify-end px-4 mx-auto">
      {/* 우측: 로그아웃 버튼 */}
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
