import { useRef, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import useProfileStore from '@/store/useProfileStore';
import useAuth from '@/hooks/useAuth';

const Profile = ({ onClose }) => {
  const inputRef = useRef(null);
  const {
    profileImages,
    setProfileImage,
    clearProfileImage,
    resetProfileImages,
  } = useProfileStore();
  const { user, setUser } = useAuth();
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [imageModified, setImageModified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링을 위한 키
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 상태 추가

  // 강제 리렌더링 함수
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 세션 스토리지에서 직접 사용자 정보 확인
        const sessionUser = sessionStorage.getItem('sessionUser');
        if (sessionUser) {
          try {
            const sessionUserData = JSON.parse(sessionUser);
            console.log(
              '✅ [ProfileModal] 세션 스토리지 사용자 정보:',
              sessionUserData
            );

            if (sessionUserData && sessionUserData.email) {
              setEmail(sessionUserData.email);
              setUserId(sessionUserData.id);

              if (sessionUserData.profileImg) {
                console.log(
                  '✅ [ProfileModal] 세션 스토리지 프로필 이미지 설정:',
                  sessionUserData.profileImg
                );
                setProfileImage(sessionUserData.id, sessionUserData.profileImg);
                setSelectedImage(sessionUserData.profileImg); // 선택된 이미지 상태 설정
              } else {
                // 프로필 이미지가 없는 경우 null로 설정
                setProfileImage(sessionUserData.id, null);
                setSelectedImage(null);
              }

              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('세션 스토리지 파싱 실패:', error);
          }
        }

        // useAuth에서 이미 사용자 정보를 가져왔다면 그것을 사용
        if (user) {
          console.log('✅ [ProfileModal] useAuth 사용자 정보:', user);
          setEmail(user.email);
          setUserId(user.id);
          if (user.profileImg) {
            console.log(
              '✅ [ProfileModal] useAuth 프로필 이미지 설정:',
              user.profileImg
            );
            setProfileImage(user.id, user.profileImg);
            setSelectedImage(user.profileImg); // 선택된 이미지 상태 설정
          } else {
            // 프로필 이미지가 없는 경우 null로 설정
            setProfileImage(user.id, null);
            setSelectedImage(null);
          }
          setIsLoading(false);
          return;
        }

        // 그렇지 않으면 API 호출
        const response = await apiClient.get('api/users/me');
        const data = await response.json();

        console.log('✅ [ProfileModal] API 사용자 정보:', data);

        if (!data || !data.success) {
          throw new Error(data?.message || '사용자 정보를 불러올 수 없습니다.');
        }

        // data.data가 배열이고 첫 번째 요소에 사용자 정보가 있음
        const userData = data.data[0];
        if (!userData || !userData.email) {
          console.warn('❌ 사용자 데이터가 올바르지 않습니다:', data);
          throw new Error('사용자 데이터가 올바르지 않습니다.');
        }

        setEmail(userData.email);
        setUserId(userData.id);

        if (userData.profileImg) {
          console.log(
            '✅ [ProfileModal] API 프로필 이미지 설정:',
            userData.profileImg
          );
          setProfileImage(userData.id, userData.profileImg);
          setSelectedImage(userData.profileImg); // 선택된 이미지 상태 설정
        } else {
          // 프로필 이미지가 없는 경우 null로 설정
          setProfileImage(userData.id, null);
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('❌ 사용자 정보 가져오기 실패:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, setProfileImage, refreshKey]); // refreshKey 의존성 추가

  // 현재 프로필 이미지 확인
  const currentProfileImage =
    selectedImage || (userId && profileImages[userId])
      ? selectedImage || profileImages[userId]
      : user?.profileImg
        ? user.profileImg
        : '/assets/icons/profile.svg';

  console.log('✅ [ProfileModal] 현재 프로필 이미지:', {
    userId,
    profileImagesState: profileImages,
    userProfileImg: user?.profileImg,
    selectedImage,
    currentProfileImage,
    refreshKey,
  });

  // 파일 선택 처리
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ [ProfileModal] 파일이 선택되지 않았습니다.');
      return;
    }

    console.log(
      '✅ [ProfileModal] 파일 선택됨:',
      file.name,
      file.type,
      file.size
    );

    if (!file.type.startsWith('image/')) {
      console.error('❌ [ProfileModal] 유효하지 않은 파일 형식:', file.type);
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      console.log('✅ [ProfileModal] 파일 읽기 완료');
      const imageDataUrl = event.target.result;
      setSelectedImage(imageDataUrl);
      setImageModified(true);
      forceRefresh();
    };

    reader.onerror = error => {
      console.error('❌ [ProfileModal] 파일 읽기 실패:', error);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsDataURL(file);
  };

  // 이미지 업로드 처리
  const handleImageUpload = async () => {
    if (!selectedImage) {
      console.error('❌ [ProfileModal] 업로드할 이미지가 없습니다.');
      alert('업로드할 이미지가 없습니다.');
      return false;
    }

    if (!userId) {
      console.error('❌ [ProfileModal] 사용자 ID가 없습니다.');
      alert('사용자 정보를 찾을 수 없습니다.');
      return false;
    }

    try {
      console.log('✅ [ProfileModal] 이미지 업로드 시작:', {
        userId,
        imageSize: selectedImage.length,
      });

      const response = await apiClient.patch('api/users/me', {
        json: { profileImg: selectedImage },
      });

      const data = await response.json();
      console.log('✅ [ProfileModal] 이미지 업로드 응답:', data);

      if (!data.success) {
        throw new Error(data.message || '프로필 이미지 업로드 실패');
      }

      console.log('✅ [ProfileModal] 프로필 이미지 업로드 성공');

      // 세션 스토리지에서 사용자 정보 업데이트
      const sessionUser = sessionStorage.getItem('sessionUser');
      if (sessionUser) {
        const userData = JSON.parse(sessionUser);
        userData.profileImg = selectedImage;
        sessionStorage.setItem('sessionUser', JSON.stringify(userData));

        // useAuth의 사용자 정보도 업데이트
        if (setUser) {
          setUser({ ...userData });
        }
      }

      // 프로필 이미지 상태 업데이트
      setProfileImage(userId, selectedImage);
      setImageModified(false);
      forceRefresh();

      return true;
    } catch (error) {
      console.error('❌ [ProfileModal] 이미지 업로드 실패:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
      return false;
    }
  };

  // 저장 후 닫기
  const handleSaveAndClose = async () => {
    if (imageModified && selectedImage) {
      const success = await handleImageUpload();
      if (success) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // 이미지 삭제
  const handleImageDelete = async () => {
    try {
      console.log('✅ [ProfileModal] 이미지 삭제 시작');

      const response = await apiClient.delete('api/users/me');
      const data = await response.json();

      console.log('✅ [ProfileModal] 이미지 삭제 응답:', data);

      if (!data.success) {
        throw new Error(data.message || '이미지 삭제 실패');
      }

      // 프로필 이미지 상태 초기화
      clearProfileImage(userId);
      setSelectedImage(null);

      // 세션 스토리지에서 사용자 정보 업데이트
      const sessionUser = sessionStorage.getItem('sessionUser');
      if (sessionUser) {
        const userData = JSON.parse(sessionUser);
        userData.profileImg = null;
        sessionStorage.setItem('sessionUser', JSON.stringify(userData));

        // useAuth의 사용자 정보도 업데이트
        if (setUser) {
          setUser({ ...userData });
        }
      }

      // 이미지 변경 상태 업데이트
      setImageModified(true);
      console.log('✅ [ProfileModal] 프로필 이미지 삭제 성공');

      // 즉시 UI에 반영
      forceRefresh();

      // 모든 프로필 이미지 상태 초기화 (선택적)
      resetProfileImages();
    } catch (error) {
      console.error('❌ [ProfileModal] 이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  // 취소 처리
  const handleCancel = () => {
    if (imageModified) {
      if (window.confirm('변경사항을 저장하시겠습니까?')) {
        handleSaveAndClose();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">오류 발생: {error}</div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <button onClick={handleCancel} className="absolute top-3 right-3">
        <img
          src="/assets/icons/cancel.svg"
          className="w-7 h-7 hover:opacity-60 transition-colors brightness-0 invert-[1]"
        />
      </button>

      <div
        className="bg-white w-full max-w-sm rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              key={refreshKey} // 강제 리렌더링을 위한 키
              src={currentProfileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold">{email}</h2>
        </div>

        <div className="border-t border-gray-200">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="block w-full py-2.5 text-center text-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            사진 업로드
          </label>
        </div>

        <div className="border-t border-gray-200">
          <button
            onClick={handleImageDelete}
            className="w-full py-2.5 text-red-500 hover:bg-gray-50 transition-colors"
          >
            현재 사진 삭제
          </button>
        </div>

        {imageModified && (
          <div className="border-t border-gray-200">
            <button
              onClick={handleImageUpload}
              className="w-full py-2.5 text-blue-500 hover:bg-gray-50 transition-colors"
            >
              변경사항 저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
