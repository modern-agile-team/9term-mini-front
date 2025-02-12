import { useState, useRef } from 'react';

const CommentInput = ({ onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const isSubmitting = useRef(false);
  const isComposing = useRef(false); // 한글 입력 상태 체크

  const handleAddComment = () => {
    if (isSubmitting.current || newComment.trim() === '') return;

    isSubmitting.current = true; // 중복 방지
    onAddComment(newComment);
    setNewComment(''); // 입력창 초기화

    setTimeout(() => {
      isSubmitting.current = false; // 다음 입력 가능하도록 초기화
    }, 100);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      e.preventDefault(); // 엔터 입력 시 줄 바꿈 방지
      handleAddComment();
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true; // 한글 조합 중
  };

  const handleCompositionEnd = () => {
    isComposing.current = false; // 한글 조합 완료 후
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart} // 🔹 한글 조합 시작 감지
        onCompositionEnd={handleCompositionEnd} // 🔹 한글 조합 완료 감지
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
