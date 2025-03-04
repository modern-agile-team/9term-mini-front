import { useState, useEffect, useRef } from 'react';
import apiClient from '@/services/apiClient'; // ky 인스턴스 가져오기

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]); // ✅ 피드 데이터
  const [page, setPage] = useState(1); // 🔹 페이지 번호 추가
  const [isLoading, setLoading] = useState(false); // 🔹 중복 호출 방지
  const [hasMore, setHasMore] = useState(true); // 🔹 더 이상 불러올 데이터 없을 때 중지
  const observerRef = useRef(null);
  const observerInstance = useRef(null);

  // 🔹 API에서 피드 데이터 불러오기 (ky 사용)
  const fetchPosts = async (page = 1) => {
    try {
      const response = await apiClient.get('/api/posts', {
        searchParams: { page },
      });

      const data = await response.json();
      console.log('📢 [useFetchPosts] 불러온 게시물:', data);

      return data;
    } catch (error) {
      console.error('❌ 피드 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // 🔹 첫 번째 페이지 로드
  // 🔹 첫 번째 페이지 로드
  useEffect(() => {
    fetchPosts().then(data => {
      if (data) {
        setPosts(data);
      } else {
        console.warn('⚠️ [useFetchPosts] 불러온 데이터가 없음!');
      }
    });
  }, []);

  // 🔹 Intersection Observer를 사용한 무한 스크롤 구현
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    if (observerInstance.current) observerInstance.current.disconnect();

    observerInstance.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          console.log('🔍 [INFO] Observer 트리거됨 - 추가 데이터 로드');
          //fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    observerInstance.current.observe(observerRef.current);

    return () => {
      if (observerInstance.current) observerInstance.current.disconnect();
    };
  }, [posts, hasMore, isLoading]);

  return { posts, observerRef, isLoading };
};

export default useFetchPosts;
