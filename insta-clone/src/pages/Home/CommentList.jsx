const CommentList = ({
  postId,
  currentUser,
  commentList = [],
  onDeleteComment,
}) => {
  return (
    <div className="mt-2">
      {commentList?.length > 0 ? (
        commentList.map(comment => (
          <div key={comment.id} className="flex justify-between items-center">
            <p className="text-sm">
              <span className="font-bold">{comment.userId}</span>&nbsp;
              {comment.comment}
            </p>
            {currentUser?.email === comment.userId && (
              <button
                className="text-red-500 text-xs ml-2"
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
