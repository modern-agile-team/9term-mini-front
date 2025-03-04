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
      const data = await apiClient
        .patch(`api/posts/${postId}/like`, {
          json: { isLiked: !isLiked }, // ✅ ky에서는 json 속성을 사용
        })
        .json();

      setIsLiked(data.likes > likeCount);
      setLikeCount(data.likes);
    } catch (error) {
      console.error('❌ 좋아요 토글 실패:', error);
    }
  };

  return { likeCount, isLiked, toggleLike };
}
