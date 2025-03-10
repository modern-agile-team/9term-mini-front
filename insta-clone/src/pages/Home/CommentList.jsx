const CommentList = ({
  postId,
  currentUser,
  commentList = [],
  onDeleteComment,
}) => {
  return (
    <div className="mt-2 space-y-2">
      {commentList?.length > 0 ? (
        commentList.map(comment => (
          <div key={comment.id} className="flex items-start">
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

export default CommentList;
