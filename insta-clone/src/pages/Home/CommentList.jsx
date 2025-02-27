import useComments from '@/hooks/useComments'; // useComments 훅 사용

const CommentList = ({ postId, currentUser }) => {
  // useComments 훅에서 댓글 목록과 삭제 함수 가져옴
  const { commentList, deleteComment } = useComments({ postId });

  return (
    <div className="mt-2">
      {commentList.map(comment => (
        <div key={comment.id} className="flex justify-between items-center">
          <p className="text-sm">
            <span className="font-bold">{comment.username}</span>&nbsp;
            {comment.text}
          </p>
          {currentUser === comment.username && (
            <button
              className="text-red-500 text-xs ml-2"
              onClick={() => deleteComment(comment.id)} // 댓글 삭제 호출
            >
              삭제
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
