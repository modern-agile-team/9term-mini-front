import React, { useState, useEffect } from 'react';

const FeedCard = ({ username, image, caption, likes = 0, comments = [] }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [commentList, setCommentList] = useState(comments);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인된 사용자 정보

  // 🔹 현재 로그인된 사용자 정보 불러오기 (MSW에서 응답)
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

  const handleAddComment = () => {
    if (newComment.trim() !== '' && currentUser) {
      const updatedComments = [
        ...commentList,
        { username: currentUser, text: newComment }, // 🔹 로그인된 사용자명으로 저장
      ];
      setCommentList(updatedComments);
      setNewComment(''); // 입력창 비우기
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
        {/* 댓글 입력창 & 게시 버튼 */}
        <div className="flex items-center space-x-2 mt-1">
          <input
            type="text"
            placeholder="댓글 달기..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full text-sm focus:outline-none p-1"
          />
          <button
            onClick={handleAddComment}
            className="text-blue-500 text-sm font-bold whitespace-nowrap cursor-pointer"
          >
            게시
          </button>
        </div>
      </div>
    </div>
  );
};

const FeedList = ({ posts }) => (
  <div className="w-full max-w-[768px] mx-auto p-6 overflow-y-scroll">
    {posts.map((post, index) => (
      <div
        key={post.id || index}
        className="w-[80%] border-b border-gray-200 last:border-none"
      >
        <FeedCard {...post} />
      </div>
    ))}
  </div>
);

const Feed = () => {
  const posts = [
    {
      id: 1,
      username: 'user1_1',
      image:
        'https://www.chosun.com/resizer/v2/CU422HY2YJHS7JQ3REJ24E4H64.PNG?auth=e52a4a4dccedb36b8dd88edd8c33e25ec341eeaf2ae40b4ac886d11257e1e801&width=616',
      caption: '여행왔슈',
      likes: 10,
      created_at: '2024-02-10T12:00:00Z',
      comments: [
        { username: 'user2', text: '멋진 사진이네요!' },
        { username: 'user3', text: '어디로 여행 가셨나요?' },
      ],
    },
    {
      id: 2,
      username: 'user2',
      image:
        'https://www.chosun.com/resizer/v2/CU422HY2YJHS7JQ3REJ24E4H64.PNG?auth=e52a4a4dccedb36b8dd88edd8c33e25ec341eeaf2ae40b4ac886d11257e1e801&width=616',
      caption: '청소년 코로나 예방캠페인',
      likes: 5,
      created_at: '2024-02-10T14:00:00Z',
      comments: [
        { username: 'user1_1', text: '좋은 캠페인이네요!' },
        { username: 'user4', text: '이런 캠페인 많이 있었으면 좋겠어요' },
      ],
    },
  ];

  return (
    <div className="feed-container">
      <FeedList posts={posts} />
    </div>
  );
};

export default Feed;
