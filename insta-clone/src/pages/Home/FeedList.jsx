import { useState, useEffect } from 'react';
import FeedCard from '@/pages/Home/FeedCard';

const FeedList = ({ posts, observerRef }) => {
  const [postList, setPostList] = useState(posts); // ✅ 초기 상태

  // ✅ `posts`가 변경될 때 `postList` 업데이트 (msw 데이터 반영)
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  // ✅ 삭제된 게시물을 상태에서 제거
  const handleDeletePost = deletedPostId => {
    setPostList(prevPosts =>
      prevPosts.filter(post => post.id !== deletedPostId)
    );
  };

  return (
    <div className="w-full max-w-[768px] mx-auto p-6 flex flex-col items-center">
      {postList.map(post => (
        <div
          key={post.id}
          className="w-[80%] border-b border-gray-200 last:border-none"
        >
          <FeedCard {...post} onDelete={handleDeletePost} />{' '}
          {/* ✅ onDelete 추가 */}
        </div>
      ))}
      {/* 🔹 마지막 피드 아래에 observerRef 배치 */}
      <div ref={observerRef} className="text-center text-xs text-gray-400 py-2">
        ⏳ 피드 불러오는 중...
      </div>
    </div>
  );
};

export default FeedList;
