import React from 'react';
import { useState } from 'react';

const FeedCard = ({ username, image, caption, likes = 0, comments = [] }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white w-full max-w-lg mx-auto shadow-sm">
      <div className="flex items-center space-x-3 mb-2">
        <img
          src="/assets/icons/profile.svg"
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-bold text-sm">{username}</span>
      </div>
      <img
        src={image}
        alt="Post"
        className="w-full rounded-lg border border-blue-300"
      />
      <div className="mt-2 px-2">
        <div className="flex items-center space-x-4 mb-1">
          <img
            src={
              isLiked ? '/assets/icons/liked.svg' : '/assets/icons/likes.svg'
            }
            alt="Like"
            className="w-5 h-5 cursor-pointer"
            onClick={handleLike}
          />
          <img
            src="/assets/icons/comments.svg"
            alt="Comment"
            className="w-5 h-5 cursor-pointer"
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
          댓글 {comments?.length || 0}개 모두보기
        </p>
        {showComments && (
          <div className="mt-2 bg-gray-100 p-2 rounded-lg">
            {comments.map((comment, index) => (
              <p key={index} className="text-sm">
                <span className="font-bold">{comment.username}</span>{' '}
                {comment.text}
              </p>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="댓글 달기..."
          className="w-full mt-1 text-sm bg-gray-100 p-2 rounded-md focus:outline-none"
        />
      </div>
    </div>
  );
};

const FeedList = ({ posts }) => (
  <div className="w-full max-w-2xl mx-auto p-6 h-screen overflow-y-scroll">
    {posts.map((post, index) => (
      <FeedCard key={index} {...post} />
    ))}
  </div>
);

const Feed = () => {
  const posts = [
    {
      id: 1,
      username: 'user1_1',
      image: 'https://source.unsplash.com/400x300/?travel',
      caption: '여행왔슈',
      likes: 10,
      created_at: '2024-02-10T12:00:00Z',
    },
    {
      id: 2,
      username: 'user2',
      image: 'https://source.unsplash.com/400x300/?poster',
      caption: '청소년 코로나 예방캠페인',
      likes: 5,
      created_at: '2024-02-10T14:00:00Z',
    },
  ];

  return (
    <div className="feed-container">
      <FeedList posts={posts} />
    </div>
  );
};

export default Feed;
