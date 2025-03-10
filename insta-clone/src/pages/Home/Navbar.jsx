import { useState, useEffect } from 'react';
import CreatePostModal from '@/pages/Posts/CreatePostModal';
import ProfileModal from '@/pages/Auth/ProfileModal';
import useProfileStore from '@/store/useProfileStore';
import apiClient from '@/services/apiClient';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { profileImages, setProfileImage } = useProfileStore();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('api/users/me');
        const data = await response.json();

        if (data?.success && data.data?.[0]) {
          const userData = data.data[0];
          setUserId(userData.id);
          if (userData.profileImg) {
            setProfileImage(userData.id, userData.profileImg);
          }
        }
      } catch (error) {
        console.error('사용자 정보 로딩 실패:', error);
      }
    };

    fetchUserData();
  }, [setProfileImage]);

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
              {userId && profileImages[userId] ? (
                <img
                  src={profileImages[userId]}
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
