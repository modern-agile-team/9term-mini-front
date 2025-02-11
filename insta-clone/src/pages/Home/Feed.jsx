import { useState, useEffect, useRef } from 'react';
import FeedCard from '@/pages/Home/FeedCard';

const FeedList = ({ posts, observerRef }) => {
  return (
    <div className="w-full max-w-[768px] mx-auto p-6 flex flex-col items-center">
      {posts.map(post => (
        <div
          key={post.id}
          className="w-[80%] border-b border-gray-200 last:border-none"
        >
          <FeedCard {...post} />
        </div>
      ))}
      {/* 🔹 마지막 피드 아래에 observerRef 배치 */}
      <div ref={observerRef} className="text-center text-xs text-gray-400 py-2">
        ⏳ 피드 불러오는 중...
      </div>
    </div>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState([]); // ✅ 초기 더미 데이터 제거 → API에서 가져옴
  const [page, setPage] = useState(1); // 🔹 페이지 번호 추가
  const [loading, setLoading] = useState(false); // 🔹 중복 호출 방지
  const [hasMore, setHasMore] = useState(true); // 🔹 더 이상 불러올 데이터 없을 때 중지
  const observerRef = useRef(null);
  const observerInstance = useRef(null);

  // 🔹 API에서 피드 데이터 불러오기 (페이지 기반)
  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/posts?page=${page}`);
      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false); // 더 이상 불러올 데이터가 없을 경우
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.id)); // 기존 ID 저장
          const filteredData = data.filter(post => !existingIds.has(post.id)); // 중복 제거
          return [...prevPosts, ...filteredData];
        });

        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ 피드 데이터를 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 처음 마운트될 때 첫 번째 페이지 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Intersection Observer를 사용한 무한 스크롤 구현
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    // 기존 observer 해제 (중복 방지)
    if (observerInstance.current) observerInstance.current.disconnect();

    observerInstance.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          console.log('🔍 [INFO] Observer 트리거됨 - 추가 데이터 로드');
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    observerInstance.current.observe(observerRef.current);

    return () => {
      if (observerInstance.current) observerInstance.current.disconnect();
    };
  }, [posts, hasMore]); // 🔹 posts, hasMore 상태 변경 시 observer 재설정

  return (
    <div className="feed-container">
      <FeedList posts={posts} observerRef={observerRef} />
    </div>
  );
};

export default Feed;
