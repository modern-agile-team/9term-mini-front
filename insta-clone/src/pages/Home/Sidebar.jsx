const Sidebar = () => {
  return (
    <div className="w-1/5 h-screen p-4 flex flex-col items-start border-r border-gray-300">
      <h2 className="text-lg font-bold mb-6">
        <img
          src="/assets/icons/instagram.svg"
          alt="Instagram"
          className="w-6 h-6"
        />
      </h2>
      <nav className="space-y-4">
        <a href="#" className="flex items-center space-x-2 text-lg">
          <img src="/assets/icons/home.svg" alt="Home" className="w-6 h-6" />
        </a>
        <a href="#" className="flex items-center space-x-2 text-lg">
          <img src="/assets/icons/plus.svg" alt="Create" className="w-6 h-6" />
        </a>
      </nav>
      <div className="mt-auto">
        <a href="/login" className="flex items-center space-x-2 text-lg">
          <img
            src="/assets/icons/logout.svg"
            alt="Logout"
            className="w-6 h-6"
          />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
