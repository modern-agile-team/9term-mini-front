import useComments from '@/hooks/useComments'; // useComments 훅 사용

const CommentList = ({ postId, currentUser }) => {
  const { commentList, deleteComment } = useComments({ postId });

  console.log(`📢 [CommentList] 받은 postId: ${postId}`);
  console.log(`📢 [CommentList] 받은 댓글 데이터:`, commentList);

  return (
    <div className="mt-2">
      {commentList?.length > 0 ? (
        commentList.map(comment => (
          <div key={comment.id} className="flex justify-between items-center">
            <p className="text-sm">
              <span className="font-bold">{comment.username}</span>&nbsp;
              {comment.text}
            </p>
            {currentUser === comment.username && (
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
