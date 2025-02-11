// src/components/CommentInput.jsx
import { useState } from 'react';

const CommentInput = ({ onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      onAddComment(newComment);
      setNewComment(''); // 입력창 초기화
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="text"
        placeholder="댓글 달기..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
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
