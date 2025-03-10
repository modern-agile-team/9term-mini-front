import { useRef, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import useProfileStore from '@/store/useProfileStore';
import useAuth from '@/hooks/useAuth';

const Profile = ({ onClose }) => {
  const inputRef = useRef(null);
  const { profileImages, setProfileImage, clearProfileImage } =
    useProfileStore();
  const { user, setUser } = useAuth();
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

            if (sessionUserData && sessionUserData.email) {
              setEmail(sessionUserData.email);
              setUserId(sessionUserData.id);

              if (sessionUserData.profileImg) {
                setProfileImage(sessionUserData.id, sessionUserData.profileImg);
              } else {
                setProfileImage(sessionUserData.id, null);
              }

              setIsLoading(false);
              return;
            }
          } catch (error) {
            // 세션 스토리지 파싱 실패 처리
          }
        }

        // useAuth에서 이미 사용자 정보를 가져왔다면 그것을 사용
        if (user) {
          setEmail(user.email);
          setUserId(user.id);
          if (user.profileImg) {
            setProfileImage(user.id, user.profileImg);
          } else {
            setProfileImage(user.id, null);
          }
          setIsLoading(false);
          return;
        }

        // 그렇지 않으면 API 호출
        const response = await apiClient.get('api/users/me').json();

        if (!response || !response.success) {
          throw new Error(
            response?.message || '사용자 정보를 불러올 수 없습니다.'
          );
        }

        // data.data가 배열이고 첫 번째 요소에 사용자 정보가 있음
        const userData = response.data[0];
        if (!userData || !userData.email) {
          throw new Error('사용자 데이터가 올바르지 않습니다.');
        }

        setEmail(userData.email);
        setUserId(userData.id);

        if (userData.profileImg) {
          setProfileImage(userData.id, userData.profileImg);
        } else {
          setProfileImage(userData.id, null);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, setProfileImage]);

  // 현재 프로필 이미지 확인
  const currentProfileImage =
    userId && profileImages[userId]
      ? profileImages[userId]
      : user?.profileImg
        ? user.profileImg
        : '/assets/icons/profile.svg';

  // 파일 선택 처리
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async event => {
      const imageDataUrl = event.target.result;

      // 이미지 업로드 처리
      try {
        const response = await apiClient
          .patch('api/users/me', {
            json: { profileImg: imageDataUrl },
          })
          .json();

        if (!response.success) {
          throw new Error(response.message || '프로필 이미지 업로드 실패');
        }

        // 세션 스토리지에서 사용자 정보 업데이트
        const sessionUser = sessionStorage.getItem('sessionUser');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          userData.profileImg = imageDataUrl;
          sessionStorage.setItem('sessionUser', JSON.stringify(userData));

          // useAuth의 사용자 정보도 업데이트
          if (setUser) {
            setUser({ ...userData });
          }
        }

        // 프로필 이미지 상태 업데이트
        setProfileImage(userId, imageDataUrl);

        // 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('profile:updated', {
            detail: { profileImg: imageDataUrl },
          })
        );
      } catch (error) {
        alert(error.message || '이미지 업로드에 실패했습니다.');
      }
    };

    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsDataURL(file);
  };

  // 이미지 삭제
  const handleImageDelete = async () => {
    try {
      const response = await apiClient.delete('api/users/me').json();

      if (!response.success) {
        throw new Error(response.message || '이미지 삭제 실패');
      }

      // 프로필 이미지 상태 초기화
      clearProfileImage(userId);

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

      // 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('profile:updated', {
          detail: { profileImg: null },
        })
      );
    } catch (error) {
      alert('이미지 삭제에 실패했습니다.');
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
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-3 right-3">
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
      </div>
    </div>
  );
};

export default Profile;
