import { useState, useEffect, useCallback } from 'react';
import CreatePostModal from '@/pages/Posts/CreatePostModal';
import ProfileModal from '@/pages/Auth/ProfileModal';
import useProfileStore from '@/store/useProfileStore';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { profileImages, setProfileImage } = useProfileStore();
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링을 위한 키

  // 사용자 정보 새로고침 함수
  const refreshUserData = useCallback(async () => {
    try {
      // 세션 스토리지에서 최신 사용자 정보 가져오기
      const sessionUser = sessionStorage.getItem('sessionUser');
      if (sessionUser) {
        try {
          const userData = JSON.parse(sessionUser);
          console.log(
            '✅ [Navbar] 세션 스토리지 사용자 정보 새로고침:',
            userData
          );
          setUserId(userData.id);

          // 프로필 이미지가 있으면 설정, 없으면 null로 설정
          if (userData.profileImg) {
            setProfileImage(userData.id, userData.profileImg);
          } else {
            setProfileImage(userData.id, null);
          }

          // 강제 리렌더링
          setRefreshKey(prev => prev + 1);
        } catch (error) {
          console.error('세션 스토리지 파싱 실패:', error);
        }
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
  }, [setProfileImage]);

  // 사용자 정보 및 프로필 이미지 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // useAuth에서 이미 사용자 정보를 가져왔다면 그것을 사용
        if (user) {
          console.log('✅ [Navbar] 사용자 정보 (useAuth):', user);
          setUserId(user.id);
          if (user.profileImg) {
            setProfileImage(user.id, user.profileImg);
          } else {
            setProfileImage(user.id, null);
          }
          return;
        }

        // 그렇지 않으면 API 호출
        const response = await apiClient.get('api/users/me');
        const data = await response.json();
        console.log('✅ [Navbar] 사용자 정보 (API):', data);

        if (data?.success && data.data?.[0]) {
          const userData = data.data[0];
          setUserId(userData.id);
          if (userData.profileImg) {
            setProfileImage(userData.id, userData.profileImg);
          } else {
            setProfileImage(userData.id, null);
          }
        }
      } catch (error) {
        console.error('사용자 정보 로딩 실패:', error);
      }
    };

    fetchUserData();
  }, [user, setProfileImage, refreshKey]); // refreshKey 의존성 추가

  // 프로필 모달이 닫힐 때 사용자 정보 다시 가져오기
  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
    // 사용자 정보 새로고침
    refreshUserData();
  };

  // 현재 프로필 이미지 확인
  const currentProfileImage =
    userId && profileImages[userId]
      ? profileImages[userId]
      : user?.profileImg
        ? user.profileImg
        : '/assets/icons/profile.svg';

  console.log('✅ [Navbar] 현재 프로필 이미지:', {
    userId,
    profileImagesState: profileImages,
    userProfileImg: user?.profileImg,
    currentProfileImage,
    refreshKey,
  });

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
                key={refreshKey} // 강제 리렌더링을 위한 키
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
