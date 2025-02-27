import { useState, useRef } from 'react';
import useComments from '@/hooks/useComments'; // useComments 훅 사용

const CommentInput = ({ postId }) => {
  const [newComment, setNewComment] = useState('');
  const isSubmitting = useRef(false);
  const isComposing = useRef(false); // 한글 입력 상태 체크

  // useComments 훅에서 addComment를 가져옴
  const { addComment } = useComments({ postId });

  const handleAddComment = async () => {
    if (isSubmitting.current || newComment.trim() === '') return;

    isSubmitting.current = true;
    await addComment(newComment); // 댓글 추가
    setNewComment('');

    setTimeout(() => {
      isSubmitting.current = false;
    }, 100);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="w-full text-sm focus:outline-none p-1"
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

export default CommentInput;
