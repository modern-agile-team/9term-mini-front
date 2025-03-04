import { useRef, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient'; // apiClient 사용
import useProfileStore from '@/store/useProfileStore';

const Profile = ({ onClose }) => {
  const inputRef = useRef(null);
  const { profileImage, setProfileImage } = useProfileStore();
  const [email, setEmail] = useState('');
  const [imageModified, setImageModified] = useState(false); //이미지 변경여부확인

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('api/users/me');
        const data = await response.json();
        console.log('✅ 사용자 정보:', data); // 응답 확인

        if (data.email) {
          // 🔥 `success` 체크 제거
          setEmail(data.email);
        } else {
          console.warn('❌ 이메일 데이터가 없습니다!');
        }
      } catch (error) {
        console.error('❌ 사용자 정보 가져오기 실패:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleFile = file => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImageModified(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async imageToUpload => {
    try {
      const response = await apiClient.patch('api/users/me', {
        json: { profileImage: imageToUpload }, // 프로필 이미지 수정
      });

      if (!response.ok) {
        throw new Error('프로필 이미지 업로드 실패');
      }

      console.log('✅ 프로필 이미지 업로드 성공');
    } catch (error) {
      console.error(error.message);
      alert('이미지 업로드에 실패했습니다.');
      setProfileImage(null);
    }
  };

  const handleSaveAndClose = async () => {
    if (profileImage) {
      await handleImageUpload(profileImage);
    }
    onClose();
  };

  const handleImageDelete = async () => {
    try {
      const response = await apiClient.delete('/api/users/me', {
        json: { profileImage: null }, // 프로필 이미지 삭제
      });

      if (!response.ok) {
        throw new Error('이미지 삭제 실패');
      }

      setProfileImage(null);
      setImageModified(true); //이미지 변경
      console.log('✅ 프로필 이미지 삭제 성공');
    } catch (error) {
      console.error('이미지 삭제 에러:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

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
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/assets/icons/profile.svg"
                alt="Default Profile"
                className="w-full h-full object-cover bg-gray-200"
              />
            )}
          </div>
          <h2 className="text-xl font-semibold">{email}</h2>
        </div>

        <div className="border-t border-gray-200">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
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
