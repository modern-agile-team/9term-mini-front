import { memo } from 'react';

const CommentList = ({
  postId,
  currentUser,
  commentList = [],
  onDeleteComment,
}) => {
  // commentList가 배열인지 확인
  const safeCommentList = Array.isArray(commentList) ? commentList : [];

  return (
    <div className="mt-2 space-y-2">
      {safeCommentList?.length > 0 ? (
        safeCommentList.map(comment => (
          <div
            key={comment.id || `comment-${Math.random()}`}
            className="flex items-start"
          >
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-bold">{comment.userId}</span>&nbsp;
                {comment.comment}
              </p>
            </div>
            {currentUser?.email === comment.userId && (
              <button
                className="text-red-500 text-xs ml-2 flex-shrink-0 whitespace-nowrap"
                onClick={() => onDeleteComment(comment.id)}
              >
                삭제
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">댓글이 없습니다.</p>
      )}
    </div>
  );
};

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(CommentList);
