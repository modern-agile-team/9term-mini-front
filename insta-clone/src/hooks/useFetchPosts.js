import { useEffect, useRef, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import usePostStore from '@/store/usePostStore';

// 게시물 캐시 (전역 레벨)
const postsCache = {
  data: [],
  lastFetchTime: 0,
  expiryTime: 60000, // 1분 캐시 유효 시간
};

const useFetchPosts = () => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const {
    posts,
    isLoading,
    hasMore,
    page,
    setPosts,
    setLoading,
    setHasMore,
    incrementPage,
  } = usePostStore();

  const observerRef = useRef(null);
  const observerInstance = useRef(null);
  const isMounted = useRef(true);
  const isInitialLoad = useRef(posts.length === 0);

  // 컴포넌트 언마운트 시 isMounted 플래그 업데이트
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ API에서 피드 데이터 불러오기 (캐싱 적용)
  const fetchPosts = useCallback(
    async (forceRefresh = false) => {
      if (isLoading || !hasMore) return;

      // 첫 페이지이고 캐시가 유효한 경우 캐시 사용
      const now = Date.now();
      if (
        page === 1 &&
        !forceRefresh &&
        postsCache.data.length > 0 &&
        now - postsCache.lastFetchTime < postsCache.expiryTime
      ) {
        if (isMounted.current) {
          setPosts(postsCache.data);
          incrementPage();
        }
        return;
      }

      if (isMounted.current) {
        setLoading(true);
      }

      try {
        const response = await apiClient
          .get('api/posts', { searchParams: { page } })
          .json();

        // ✅ 올바른 데이터 구조인지 확인
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error('잘못된 API 응답 형식: 데이터가 배열이 아닙니다.');
        }

        if (response.data.length === 0) {
          if (isMounted.current) {
            setHasMore(false);
          }
          // Observer 연결 해제
          if (observerInstance.current) {
            observerInstance.current.disconnect();
          }
        } else {
          // ✅ 중복 게시물 필터링 및 상태 업데이트
          const newPosts = response.data.filter(
            newPost => !posts.some(post => post.postId === newPost.postId)
          );

          // 새로운 게시물이 없으면 더 이상 불러올 데이터가 없는 것으로 간주
          if (newPosts.length === 0) {
            if (isMounted.current) {
              setHasMore(false);
            }
            // Observer 연결 해제
            if (observerInstance.current) {
              observerInstance.current.disconnect();
            }
          } else {
            // 기존 게시물과 새 게시물 합치기
            const updatedPosts = [...posts, ...newPosts];

            if (isMounted.current) {
              setPosts(updatedPosts);
              incrementPage();
            }

            // 첫 페이지인 경우 캐시 업데이트
            if (page === 1) {
              postsCache.data = response.data;
              postsCache.lastFetchTime = now;
            }
          }
        }
      } catch (error) {
        if (isMounted.current) {
          setHasMore(false);
        }
        // Observer 연결 해제
        if (observerInstance.current) {
          observerInstance.current.disconnect();
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [
      isLoading,
      hasMore,
      page,
      posts,
      setPosts,
      setLoading,
      setHasMore,
      incrementPage,
    ]
  );

  // ✅ 첫 번째 페이지 로드 (캐시 활용)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchPosts();
    }
  }, [fetchPosts]);

  // ✅ Intersection Observer를 사용한 무한 스크롤 (디바운스 적용)
  useEffect(() => {
    const currentObserverRef = observerRef.current;
    let debounceTimer = null;

    // hasMore가 false면 Observer를 설정하지 않음
    if (!currentObserverRef || !hasMore) {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
      return;
    }

    // 이전 옵저버 정리
    if (observerInstance.current) {
      observerInstance.current.disconnect();
    }

    observerInstance.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          // 디바운스 적용 (300ms)
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchPosts();
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    observerInstance.current.observe(currentObserverRef);

    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
      clearTimeout(debounceTimer);
    };
  }, [isLoading, hasMore, fetchPosts]);

  // 강제 새로고침 함수 추가
  const refreshPosts = () => {
    if (isMounted.current) {
      setPosts([]);
      setHasMore(true);
      // 페이지를 1로 리셋하는 로직이 필요하다면 여기에 추가
      fetchPosts(true);
    }
  };

  return { posts, observerRef, isLoading, hasMore, refreshPosts };
};

export default useFetchPosts;
