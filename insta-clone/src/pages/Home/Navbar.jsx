import { useState } from 'react';
import CreatePostModal from '@/pages/Posts/CreatePostModal';
import ProfileModal from '@/pages/Auth/ProfileModal';
import useProfileStore from '@/store/useProfileStore';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { profileImage } = useProfileStore();

  return (
    <>
      <nav className="w-full max-w-[768px] h-14 px-4 flex items-center justify-between border-b border-gray-300 bg-white">
        <div className="text-xl font-bold">
          <img src="/assets/icons/logo.svg" alt="Instagram" className="w-30" />
        </div>
        <div className="flex gap-2">
          {/* 게시물 추가 버튼 */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src="/assets/icons/plus.svg"
              alt="Create Post"
              className="w-7 h-7"
            />
          </button>
          {/* 프로필 버튼 */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/assets/icons/profile.svg"
                  alt="Profile"
                  className="w-7 h-7"
                />
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* 모달 */}
      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} />}
      {isProfileModalOpen && (
        <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
