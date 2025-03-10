import { useState, useEffect } from 'react';
import CreatePostModal from '@/pages/Posts/CreatePostModal';
import ProfileModal from '@/pages/Auth/ProfileModal';
import useProfileStore from '@/store/useProfileStore';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { profileImages, setProfileImage } = useProfileStore();
  const { user, setUser } = useAuth();
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 사용자 정보 및 프로필 이미지 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // useAuth에서 이미 사용자 정보를 가져왔다면 그것을 사용
        if (user) {
          setUserId(user.id);
          if (user.profileImg) {
            setProfileImage(user.id, user.profileImg);
          } else {
            setProfileImage(user.id, null);
          }
          return;
        }

        // 그렇지 않으면 API 호출
        const response = await apiClient.get('api/users/me').json();

        if (response?.success && response.data?.[0]) {
          const userData = response.data[0];
          setUserId(userData.id);
          if (userData.profileImg) {
            setProfileImage(userData.id, userData.profileImg);
          } else {
            setProfileImage(userData.id, null);
          }
        }
      } catch (error) {
        // 오류 처리
      }
    };

    fetchUserData();
  }, [user, setProfileImage, refreshKey]);

  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = event => {
      // 이벤트에서 프로필 이미지 데이터 가져오기
      if (event.detail && user) {
        // 프로필 이미지 상태 직접 업데이트 (null인 경우도 처리)
        setProfileImage(user.id, event.detail.profileImg);

        // 사용자 정보 직접 업데이트
        if (user) {
          setUser({
            ...user,
            profileImg: event.detail.profileImg,
          });
        }
      }
      // 강제 리렌더링
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('profile:updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile:updated', handleProfileUpdate);
    };
  }, [user, setProfileImage, setUser]);

  // 프로필 모달이 닫힐 때 사용자 정보 다시 가져오기
  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  // 현재 프로필 이미지 확인
  const currentProfileImage =
    userId && profileImages[userId]
      ? profileImages[userId]
      : user?.profileImg
        ? user.profileImg
        : '/assets/icons/profile.svg';

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
              <img
                key={refreshKey}
                src={currentProfileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </div>
      </nav>

      {/* 모달 */}
      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} />}
      {isProfileModalOpen && <ProfileModal onClose={handleProfileModalClose} />}
    </>
  );
};

export default Navbar;
