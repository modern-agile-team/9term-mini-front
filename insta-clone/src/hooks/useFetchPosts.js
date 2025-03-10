import { useState, useEffect, useRef } from 'react';
import apiClient from '@/services/apiClient';

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]); // ✅ 피드 데이터
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const observerInstance = useRef(null);

  // ✅ API에서 피드 데이터 불러오기
  const fetchPosts = async () => {
    if (isLoading || !hasMore) return;
    setLoading(true);

    try {
      const response = await apiClient
        .get('api/posts', { searchParams: { page } })
        .json();

      // ✅ 올바른 데이터 구조인지 확인
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error('잘못된 API 응답 형식: 데이터가 배열이 아닙니다.');
      }

      console.log('📢 [useFetchPosts] 불러온 게시물:', response.data);

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        // ✅ 중복 게시물 필터링
        setPosts(prevPosts => {
          const newPosts = response.data.filter(
            newPost => !prevPosts.some(post => post.postId === newPost.postId)
          );
          return [...prevPosts, ...newPosts];
        });
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('❌ 피드 데이터를 불러오는 중 오류 발생:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 첫 번째 페이지 로드
  useEffect(() => {
    setPosts([]); // 컴포넌트 마운트 시 게시물 초기화
    setPage(1); // 페이지 초기화
    setHasMore(true); // hasMore 초기화
    fetchPosts();
  }, []);

  // ✅ Intersection Observer를 사용한 무한 스크롤
  useEffect(() => {
    const currentObserverRef = observerRef.current;

    if (!currentObserverRef || !hasMore) return;

    // 이전 옵저버 정리
    if (observerInstance.current) {
      observerInstance.current.disconnect();
    }

    observerInstance.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          console.log('🔍 [INFO] Observer 트리거됨 - 추가 데이터 로드');
          fetchPosts();
        }
      },
      { threshold: 0.5 }
    );

    observerInstance.current.observe(currentObserverRef);

    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
      }
    };
  }, [isLoading, hasMore]);

  return { posts, observerRef, isLoading, hasMore };
};

export default useFetchPosts;
