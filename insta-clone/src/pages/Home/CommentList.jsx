const CommentList = ({ comments, currentUser, onDeleteComment }) => {
  return (
    <div className="mt-2">
      {comments.map(comment => (
        <div key={comment.id} className="flex justify-between items-center">
          <p className="text-sm">
            <span className="font-bold">{comment.username}</span>&nbsp;
            {comment.text}
          </p>
          {currentUser === comment.username && (
            <button
              className="text-red-500 text-xs ml-2"
              onClick={() => onDeleteComment(comment.id)}
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
