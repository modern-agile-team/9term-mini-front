import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full max-w-[768px] h-14 px-4 flex items-center justify-between border-b border-gray-300 bg-white">
      <div className="text-xl font-bold">
        <img src="/assets/icons/logo.svg" alt="Instagram" className="w-30" />
      </div>
      <button className="p-2 rounded-full hover:bg-gray-100 transition">
        <img
          src="/assets/icons/plus.svg"
          alt="Create Post"
          className="w-7 h-7"
        />
      </button>
    </nav>
  );
};

export default Navbar;
