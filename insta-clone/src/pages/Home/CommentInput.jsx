import { useState, useRef, memo } from 'react';
import useComments from '@/hooks/useComments'; // useComments 훅 사용

const CommentInput = ({ postId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const isSubmitting = useRef(false);
  const isComposing = useRef(false);

  const { addComment } = useComments({ postId });

  const handleAddComment = async () => {
    if (isSubmitting.current || newComment.trim() === '') return;

    isSubmitting.current = true;
    await addComment(newComment);
    setNewComment('');

    // 댓글 추가 후 콜백 함수 호출 (필요한 경우에만)
    if (onCommentAdded && typeof onCommentAdded === 'function') {
      // 콜백 함수 호출 (지연 시간 제거)
      onCommentAdded();
    }

    setTimeout(() => {
      isSubmitting.current = false;
    }, 100);
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        className="w-full text-sm focus:outline-none p-1"
        onKeyPress={e => {
          if (e.key === 'Enter' && !isComposing.current) {
            e.preventDefault();
            handleAddComment();
          }
        }}
        onCompositionStart={() => (isComposing.current = true)}
        onCompositionEnd={() => (isComposing.current = false)}
      />
      <button
        onClick={handleAddComment}
        className="text-blue-500 text-sm font-bold whitespace-nowrap cursor-pointer"
      >
        게시
      </button>
    </div>
  );
};

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(CommentInput);
