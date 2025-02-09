// src/pages/Home/FeedCard.jsx
import React, { useState, useEffect } from 'react';
import CommentInput from './CommentInput';

const FeedCard = ({ username, image, caption, likes = 0, comments = [] }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [commentList, setCommentList] = useState(comments);
  const [currentUser, setCurrentUser] = useState(null);

  // 현재 로그인된 사용자 정보 불러오기 (MSW에서 응답)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setCurrentUser(data.username);
      } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleAddComment = newComment => {
    if (newComment.trim() !== '' && currentUser) {
      setCommentList([
        ...commentList,
        { username: currentUser, text: newComment },
      ]);
    }
  };

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
            onClick={handleLike}
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
            {commentList.map((comment, index) => (
              <p key={index} className="text-sm">
                <span className="font-bold">{comment.username}</span>{' '}
                {comment.text}
              </p>
            ))}
          </div>
        )}
        <CommentInput onAddComment={handleAddComment} />
      </div>
    </div>
  );
};

export default FeedCard;
