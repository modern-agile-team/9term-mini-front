import { useState, useEffect, useRef } from 'react';

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]); // ✅ 피드 데이터
  const [page, setPage] = useState(1); // 🔹 페이지 번호 추가
  const [loading, setLoading] = useState(false); // 🔹 중복 호출 방지
  const [hasMore, setHasMore] = useState(true); // 🔹 더 이상 불러올 데이터 없을 때 중지
  const observerRef = useRef(null);
  const observerInstance = useRef(null);

  // 🔹 API에서 피드 데이터 불러오기
  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/posts?page=${page}`);
      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.id));
          const filteredData = data.filter(post => !existingIds.has(post.id));
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

  // 🔹 첫 번째 페이지 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Intersection Observer를 사용한 무한 스크롤 구현
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

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
  }, [posts, hasMore]);

  return { posts, observerRef, loading };
};

export default useFetchPosts;
