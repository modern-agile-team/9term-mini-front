import apiClient from '@/services/apiClient';
import { useState, useRef } from 'react';

const CreatePostModal = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [content, setContent] = useState('');
  const inputRef = useRef(null);

  // 파일 처리 함수
  const handleFile = file => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 & 드롭 이벤트 핸들러
  const handleDragOver = e => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // ✅ API: 게시물 등록
  const handleUpload = async () => {
    if (!selectedImage) return;

    try {
      const response = await apiClient
        .post('/api/posts', {
          json: { postImg: selectedImage, content },
        })
        .json();

      if (!response.ok) throw new Error('게시물 업로드 실패');

      alert('게시물이 업로드되었습니다.');
      onClose(); // ✅ 업로드 후 모달 닫기
    } catch (error) {
      console.error(error.message);
    }
  };

  // ✅ 취소 버튼 핸들러
  const handleCancel = () => {
    if (selectedImage || content) {
      if (
        window.confirm('작성 중인 내용이 삭제됩니다. 그래도 나가시겠습니까?')
      ) {
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
      <div
        className="bg-white w-full max-w-[500px] rounded-xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative flex items-center justify-between p-3 border-b border-gray-200">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-black"
          >
            취소
          </button>
          <h2 className="text-base font-semibold">새 게시물 만들기</h2>
          {selectedImage && (
            <button
              onClick={handleUpload}
              className="text-sm font-medium text-[#0095F6] hover:text-[#1877F2] transition-colors"
            >
              공유하기
            </button>
          )}
        </div>

        {/* 컨텐츠 영역 */}
        <div
          className={`flex flex-col items-center justify-center flex-1 bg-white px-6 py-10 ${
            dragActive ? 'bg-gray-100' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedImage ? (
            <>
              {/* 이미지 미리보기 */}
              <div className="w-full h-[300px] bg-black flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {/* 글쓰기 영역 */}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="문구 입력..."
                className="w-full mt-4 p-2 bg-[#fafafa] border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
                maxLength={500}
              />
              <div className="w-full flex justify-end text-sm text-gray-500">
                <span>{content.length}/500</span>
              </div>
            </>
          ) : (
            <div className="text-center flex flex-col justify-center items-center">
              <img src="/assets/icons/photo.svg" className="mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                {dragActive
                  ? '사진을 놓아주세요!'
                  : '사진을 여기에 끌어다 놓으세요'}
              </p>
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
                className="bg-[#0095F6] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1877F2] transition-colors"
              >
                컴퓨터에서 선택
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
