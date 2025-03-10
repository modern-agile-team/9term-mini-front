import { useState, useEffect } from 'react';
import useFetchPosts from '@/hooks/useFetchPosts';
import FeedList from '@/pages/Home/FeedList';

const Feed = () => {
  const { posts, observerRef, isLoading, hasMore } = useFetchPosts();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 초기 로딩 상태 관리
  useEffect(() => {
    // 게시물이 로드되었거나 더 이상 게시물이 없으면 초기 로딩 상태 해제
    if (posts.length > 0 || !hasMore) {
      setIsInitialLoading(false);
    }
  }, [posts, hasMore]);

  // 초기 로딩 중일 때 로딩 화면 표시 (최대 1초만 표시)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 초기 로딩 중일 때 로딩 화면 표시
  if (isInitialLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-500 text-sm">게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <FeedList posts={posts} observerRef={observerRef} hasMore={hasMore} />
      {isLoading && !isInitialLoading && (
        <div className="text-center py-4">
          <div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500 text-xs">추가 게시물 로딩 중...</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
