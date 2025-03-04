import apiClient from '@/services/apiClient';
import { useState, useRef, useEffect } from 'react';

const CreatePostModal = ({ onClose, post }) => {
  const [content, setContent] = useState(post ? post.content : '');
  const inputRef = useRef(null);

  // 수정 모드 여부 (post가 있으면 수정 모드)
  const isEditMode = !!post;

  // ✅ 이미지 유지 (수정 시 기존 이미지 표시, 새 글 작성 시 업로드 가능)
  const selectedImage = post ? post.postImg : null;

  // ✅ API: 게시물 수정
  const handleUpdatePost = async () => {
    if (!content.trim()) return alert('내용을 입력해주세요.');

    try {
      await apiClient.patch(`/api/posts/${post.id}`, {
        json: { content },
      });

      alert('게시물이 수정되었습니다.');
      onClose(); // 모달 닫기
    } catch (error) {
      console.error('게시물 수정 실패:', error);
    }
  };

  // ✅ API: 새 게시물 등록
  const handleUpload = async () => {
    if (!selectedImage || !content.trim()) return;

    try {
      const response = await apiClient
        .post('/api/posts', {
          json: { postImg: selectedImage, content },
        })
        .json();

      if (!response.ok) throw new Error('게시물 업로드 실패');

      alert('게시물이 업로드되었습니다.');
      onClose();
    } catch (error) {
      console.error(error.message);
    }
  };

  // ✅ 취소 버튼 핸들러
  const handleCancel = () => {
    if (
      content &&
      window.confirm('작성 중인 내용이 삭제됩니다. 그래도 나가시겠습니까?')
    ) {
      onClose();
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
        className="bg-white w-full max-w-[500px] rounded-xl h-[min(90vh,500px)] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative flex items-center justify-center p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold">
            {isEditMode ? '게시물 수정' : '새 게시물 만들기'}
          </h2>
          <button
            onClick={isEditMode ? handleUpdatePost : handleUpload}
            className="absolute right-3 text-sm font-medium text-[#0095F6] hover:text-[#1877F2] cursor-pointer transition-colors"
          >
            {isEditMode ? '수정하기' : '공유하기'}
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="overflow-y-auto flex flex-col items-center pt-10 bg-white">
          <div className="w-full">
            {/* 이미지 미리보기 (수정 시 유지) */}
            <div className="w-full h-[250px] bg-black flex items-center justify-center">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* 글쓰기 영역 */}
            <div className="w-full mt-2 px-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="문구 입력..."
                className="w-full h-25 resize-none bg-[#fafafa] border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400 placeholder:text-sm"
                maxLength={500}
              />
              <div className="flex justify-end items-center text-sm text-gray-500">
                <span>{content.length}/500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
