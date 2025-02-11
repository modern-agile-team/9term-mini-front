// src/pages/Posts/CreatePost.jsx
import { useState, useRef } from 'react';

const CreatePost = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const inputRef = useRef(null);

  // 파일 처리 함수
  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 이벤트 핸들러
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 드롭 이벤트 핸들러
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // 파일 입력 변경 핸들러
  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (selectedImage) {
      if (window.confirm('작성 중인 내용이 삭제됩니다. 그래도 나가시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[500px] rounded-xl h-[min(90vh,700px)] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <button onClick={handleCancel} className="text-sm font-medium text-black hover:text-gray-600 transition-colors">
            취소
          </button>
          <h2 className="text-base font-semibold">새 게시물 만들기</h2>
          <button 
            className={`text-sm font-medium ${
              selectedImage 
                ? 'text-[#0095F6] hover:text-[#1877F2] cursor-pointer' 
                : 'text-[#0095F6]/40 cursor-not-allowed'
            } transition-colors`}
            disabled={!selectedImage}
          >
            공유하기
          </button>
        </div>

        {/* 컨텐츠 영역 - 스크롤 가능하도록 수정 */}
        <div className="flex-1 overflow-y-auto">
          <div 
            className={`flex ${selectedImage ? 'flex-col' : ''} min-h-[400px]
              ${dragActive ? 'bg-black/5' : 'bg-white'}
              transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <>
                <div className="w-full h-[300px] bg-black flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {/* 글쓰기 영역 */}
                <div className="p-4 border-t">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="문구 입력..."
                    className="w-full h-24 resize-none border-none focus:ring-0 text-sm"
                    maxLength={2200}
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{caption.length}/2,200</span>
                    <button className="text-[#0095F6]">이모티콘</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center px-4 py-20">
                <div className="mx-auto mb-6">
                  <div className="w-20 h-20 mx-auto border-2 border-black rounded-lg flex items-center justify-center">
                    <span className="text-4xl">+</span>
                  </div>
                </div>
                <h3 className="text-[22px] mb-4">사진을 여기에 끌어다 놓으세요</h3>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="inline-block bg-[#0095F6] text-white px-4 py-2 rounded-lg
                           text-sm font-medium cursor-pointer hover:bg-[#1877F2] 
                           transition-colors duration-200"
                >
                  컴퓨터에서 선택
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;