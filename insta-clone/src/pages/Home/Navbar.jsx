// src/pages/Home/Navbar.jsx
import React, { useState } from 'react';
import CreatePost from '../Posts/CreatePost';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="w-full max-w-[768px] h-14 px-4 flex items-center justify-between border-b border-gray-300 bg-white">
        <div className="text-xl font-bold">
          <img src="/assets/icons/logo.svg" alt="Instagram" className="w-30" />
        </div>
        {/* 🔹 + 버튼 클릭 시 모달 열기 */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src="/assets/icons/plus.svg"
            alt="Create Post"
            className="w-7 h-7"
          />
        </button>
      </nav>

      {/* ✅ CreatePost 모달 추가 */}
      {isModalOpen && <CreatePost onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Navbar;
