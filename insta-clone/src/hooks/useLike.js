import { useState } from 'react';
import apiClient from '@/services/apiClient';

export default function useLike(initialLikes = 0, postId) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = async () => {
    if (!postId) {
      console.error('❌ 좋아요 요청 실패: postId가 undefined입니다!');
      return;
    }

    try {
      const response = await apiClient
        .patch(`/api/posts/${postId}/like`, {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isLiked: !isLiked }),
        })
        .json();

      setIsLiked(response.liked);
      setLikeCount(response.likes);
    } catch (error) {
      console.error('❌ 좋아요 토글 실패:', error);
    }
  };

  return { likeCount, isLiked, toggleLike };
}
