import { useState, useEffect } from 'react';
import CommentInput from '@/pages/Home/CommentInput';
import useCurrentUser from '@/hooks/useCurrentUser';
import useLike from '@/hooks/useLike';
import useComments from '@/hooks/useComments';

const FeedCard = ({ username, image, caption, likes = 0, comments = [] }) => {
  const [showComments, setShowComments] = useState(false);
  const currentUser = useCurrentUser();
  const { likeCount, isLiked, toggleLike } = useLike(likes);
  const { commentList, addComment, deleteComment } = useComments(
    comments,
    currentUser
  );

  return (
    <div className="p-4 mb-4 bg-white w-full max-w-lg mx-auto">
      <div className="flex items-center space-x-2 mb-2">
        <img
          src="/assets/icons/profile.svg"
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-bold text-xs">{username}</span>
      </div>
      <img src={image} alt="Post" className="w-full rounded-xs" />
      <div className="mt-2 px-2">
        <div className="flex items-center space-x-4 mb-2">
          <img
            src={
              isLiked ? '/assets/icons/liked.svg' : '/assets/icons/likes.svg'
            }
            alt="Like"
            className="w-6 h-6 cursor-pointer"
            onClick={toggleLike}
          />
          <img
            src="/assets/icons/comments.svg"
            alt="Comment"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <p className="text-sm font-bold">좋아요 {likeCount}개</p>
        <p className="text-sm mt-1">
          <span className="font-bold">{username}</span> {caption}
        </p>
        <p
          className="text-xs text-gray-500 mt-1 cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          댓글 {commentList.length}개 모두보기
        </p>
        {showComments && (
          <div className="mt-2">
            {commentList.map(comment => (
              <div
                key={comment.id}
                className="flex justify-between items-center"
              >
                <p className="text-sm">
                  <span className="font-bold">{comment.username}</span>{' '}
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
            ))}
          </div>
        )}
        <CommentInput onAddComment={addComment} />
      </div>
    </div>
  );
};

export default FeedCard;
