import { useRef, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import useProfileStore from '@/store/useProfileStore';
import useAuth from '@/hooks/useAuth';

// 이미지 리사이징 함수 추가
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        // 이미지 크기 계산
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Canvas에 이미지 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 이미지 데이터 URL 생성 (품질 조정)
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

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

        // user 객체에서 사용자 정보 확인
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
  let currentProfileImage = '/assets/icons/profile.svg';

  if (userId && profileImages[userId]) {
    currentProfileImage = profileImages[userId];
  } else if (user?.profileImg) {
    currentProfileImage = user.profileImg;
  }

  // 파일 선택 처리 - 수정된 부분
  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      // 로딩 상태 표시
      setIsLoading(true);

      // 이미지 리사이징 (최대 800x800, 품질 0.7)
      const resizedImageDataUrl = await resizeImage(file, 800, 800, 0.7);

      // 리사이징된 이미지로 API 호출
      const response = await apiClient
        .patch('api/users/me', {
          json: { profileImg: resizedImageDataUrl },
        })
        .json();

      if (!response.success) {
        throw new Error(response.message || '프로필 이미지 업로드 실패');
      }

      // 프로필 이미지 상태 업데이트
      setProfileImage(userId, resizedImageDataUrl);

      // useAuth의 사용자 정보 업데이트
      if (setUser && user) {
        setUser({
          ...user,
          profileImg: resizedImageDataUrl,
        });
      }

      // 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('profile:updated', {
          detail: { profileImg: resizedImageDataUrl },
        })
      );

      alert('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      alert(error.message || '이미지 업로드에 실패했습니다.');
      console.error('이미지 업로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
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

      // useAuth의 사용자 정보 업데이트
      if (setUser && user) {
        setUser({
          ...user,
          profileImg: null,
        });
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
