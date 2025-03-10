import { useState, useRef, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import usePostStore from '@/store/usePostStore';

const CreatePostModal = ({ onClose, postId, initialData = {} }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    initialData.postImg || null
  );
  const [caption, setCaption] = useState(initialData.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Zustand 스토어에서 액션 가져오기
  const { addPost, updatePost } = usePostStore();

  // postId가 있을 경우 기존 게시물 불러오기
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await apiClient.get(`api/posts/${postId}`, {
            throwHttpErrors: false,
          });

          // 응답이 JSON인지 확인
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();

            if (!jsonResponse.success) {
              throw new Error(
                jsonResponse.message || '게시물을 불러올 수 없습니다.'
              );
            }

            setSelectedImage(jsonResponse.data.postImg);
            setCaption(jsonResponse.data.content);
          } else {
            throw new Error('서버 응답 형식 오류');
          }
        } catch (error) {
          alert(error.message || '게시물을 불러올 수 없습니다.');
        }
      };
      fetchPost();
    }
  }, [postId]);

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

  // 새 게시물 업로드 또는 수정
  const handleUpload = async () => {
    // 새 게시물 생성 시에만 이미지 필수 체크
    if (!postId && !selectedImage) {
      alert('이미지를 선택해주세요.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let response;
      const requestData = {
        content: caption,
      };

      // 이미지가 있는 경우에만 요청 데이터에 포함
      if (selectedImage) {
        requestData.postImg = selectedImage;
      }

      if (postId) {
        // 게시글 수정
        try {
          response = await apiClient.patch(`api/posts/${postId}`, {
            json: requestData,
            throwHttpErrors: false,
          });

          // 응답이 JSON인지 확인
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            response = await response.json();
          } else {
            throw new Error('서버 응답 형식 오류');
          }
        } catch (error) {
          throw error;
        }
      } else {
        // 새 게시글 생성
        try {
          response = await apiClient.post('api/posts', {
            json: requestData,
            throwHttpErrors: false,
          });

          // 응답이 JSON인지 확인
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            response = await response.json();
          } else {
            throw new Error('서버 응답 형식 오류');
          }
        } catch (error) {
          throw error;
        }
      }

      if (!response.success) {
        throw new Error(response.message || '업로드에 실패했습니다.');
      }

      // 게시물 상태 업데이트
      if (postId) {
        // 수정된 게시물 정보 업데이트
        updatePost({
          postId: postId,
          content: caption,
          postImg: selectedImage,
        });
      } else if (response.data && response.data.postId) {
        // 새 게시물 추가
        const newPost = {
          postId: response.data.postId,
          content: caption,
          postImg: selectedImage,
          createdAt: new Date().toISOString(),
          author:
            JSON.parse(sessionStorage.getItem('sessionUser'))?.email ||
            'unknown',
          likedBy: [],
        };
        addPost(newPost);
      }

      alert(postId ? '게시물이 수정되었습니다.' : '게시물이 업로드되었습니다.');
      onClose();
    } catch (error) {
      alert(error.message || '게시물 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (selectedImage) {
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
            {postId ? '게시물 수정' : '새 게시물 만들기'}
          </h2>
          {selectedImage && (
            <button
              onClick={handleUpload}
              disabled={isSubmitting}
              className={`absolute right-3 text-sm font-medium ${
                isSubmitting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#0095F6] hover:text-[#1877F2] cursor-pointer'
              } transition-colors`}
            >
              {isSubmitting ? '처리 중...' : postId ? '수정하기' : '공유하기'}
            </button>
          )}
        </div>

        {/* 컨텐츠 영역 */}
        <div
          className={`overflow-y-auto flex flex-col items-center pt-10 ${
            dragActive ? 'bg-gray-100' : 'bg-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`flex ${
              selectedImage ? 'flex-col' : ''
            } transition-colors duration-200`}
          >
            {selectedImage ? (
              <>
                <div className="w-full h-[250px] bg-black flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {/* 글쓰기 영역 */}
                <div className="w-full mt-2 px-4">
                  <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="문구 입력..."
                    className="w-full h-25 resize-none p-2
                    bg-[#fafafa]
                    border border-gray-300 rounded-sm focus:outline-none
                    focus:border-gray-400
                    placeholder:text-sm"
                    maxLength={500}
                  />
                  <div className="flex justify-end items-center text-sm text-gray-500">
                    <span>{caption.length}/500</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center flex-col justify-center items-center px-4 py-20">
                <div className="mx-auto mb-6 flex flex-col justify-center items-center">
                  <img src="/assets/icons/photo.svg" alt="Upload" />
                </div>
                <h3 className="text-lg mb-4">
                  {dragActive
                    ? '사진을 놓아주세요!'
                    : '사진을 여기에 끌어다 놓으세요'}
                </h3>
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
                  className="inline-block bg-[#0095F6] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1877F2] transition-colors duration-200"
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

export default CreatePostModal;
