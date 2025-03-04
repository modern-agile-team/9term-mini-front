import useComments from '@/hooks/useComments';

const CommentList = ({ postId, currentUser }) => {
  const { commentList, deleteComment } = useComments({ postId, currentUser });

  return (
    <div className="mt-2">
      {commentList?.length > 0 ? (
        commentList.map(comment => (
          <div
            key={`${comment.id}-${comment.text}`}
            className="flex justify-between items-center"
          >
            <p className="text-sm">
              <span className="font-bold">{comment.email}</span>&nbsp;
              {comment.text}
            </p>
            {currentUser.email === comment.email && (
              <button
                className="text-red-500 text-xs ml-2"
                onClick={() => deleteComment(comment.id)}
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
