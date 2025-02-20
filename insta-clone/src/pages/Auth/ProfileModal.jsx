import { useRef, useState } from 'react';
import useProfileStore from '@/store/useProfileStore';

const Profile = ({ onClose }) => {
  const inputRef = useRef(null);
  const { profileImage, setProfileImage } = useProfileStore();
  const [imageModified, setImageModified] = useState(false); //이미지 변경여부확인

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
      const response = await fetch('/api/profile/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageToUpload,
        }),
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
      const response = await fetch('/api/profile/image', {
        method: 'DELETE',
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
              <svg
                className="h-full w-full text-gray-300 bg-gray-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold">user1_1</h2>
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
