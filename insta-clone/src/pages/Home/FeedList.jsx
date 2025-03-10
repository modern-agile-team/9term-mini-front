import { useState, useEffect } from 'react';
import FeedCard from '@/pages/Home/FeedCard';

const FeedList = ({ posts = [], observerRef, hasMore = true }) => {
  // ✅ 상태를 따로 관리하여 삭제 반영 가능하도록 수정
  const [feedPosts, setFeedPosts] = useState(posts);

  useEffect(() => {
    setFeedPosts(posts); // ✅ props로 받은 posts가 변경될 때 상태 업데이트
  }, [posts]);

  const handleDeletePost = deletedPostId => {
    setFeedPosts(prevPosts =>
      prevPosts.filter(post => post.postId !== deletedPostId)
    );
  };

  return (
    <div className="w-full max-w-[768px] mx-auto p-6 flex flex-col items-center">
      {/* ✅ 피드가 없을 때 메시지 추가 */}
      {feedPosts.length > 0 ? (
        feedPosts.map(post => (
          <div
            key={post.postId}
            className="w-[80%] border-b border-gray-200 last:border-none"
          >
            <FeedCard {...post} onDelete={handleDeletePost} />
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm py-4">게시물이 없습니다.</p>
      )}

      <div ref={observerRef} className="text-center text-xs text-gray-400 py-2">
        {hasMore ? '⏳ 피드 불러오는 중...' : '더 이상 게시물이 없습니다.'}
      </div>
    </div>
  );
};

export default FeedList;
