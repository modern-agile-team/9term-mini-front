import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export default function useLike(initialLikes = 0, postId) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  // ✅ 좋아요 상태 불러오기
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!postId) return;

      try {
        const data = await apiClient.get(`api/posts/${postId}/like`).json();

        setIsLiked(data?.liked ?? false); // ✅ undefined 방지
        setLikeCount(data?.totalLikes ?? initialLikes); // ✅ 총 좋아요 수 반영
      } catch (error) {
        console.error('❌ 좋아요 상태 불러오기 실패:', error);
      }
    };

    fetchLikeStatus();
  }, [postId, initialLikes]);

  // ✅ 좋아요 토글
  const toggleLike = async () => {
    if (!postId) {
      console.error('❌ 좋아요 요청 실패: postId가 undefined입니다!');
      return;
    }

    try {
      const data = await apiClient.post(`api/posts/${postId}/like`).json();

      setIsLiked(data?.liked ?? !isLiked); // ✅ 서버 응답이 없을 경우 현재 상태 반전
      setLikeCount(
        data?.totalLikes ?? (isLiked ? likeCount - 1 : likeCount + 1)
      ); // ✅ API 응답 반영
    } catch (error) {
      console.error('❌ 좋아요 토글 실패:', error);
    }
  };

  return { likeCount, isLiked, toggleLike };
}
