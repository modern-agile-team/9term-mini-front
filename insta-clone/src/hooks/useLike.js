import { useState } from 'react';
import apiClient from '@/services/apiClient';

export default function useLike(initialLikes = 0, postId) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = async () => {
    try {
      // ky를 사용하여 POST 요청 보내기
      const response = await apiClient.post(`api/posts/${postId}/like`).json();
      // 백엔드 응답 예시: { success: true, message: "좋아요 추가됨", data: { liked: true } }
      setIsLiked(response.data.liked);

      // 만약 좋아요 개수를 바로 내려주지 않는다면, 별도로 GET 요청하여 최신 개수를 가져오거나
      // 프론트에서 isLiked 토글에 따라 likeCount를 증감시키는 방법을 사용할 수 있음.
      // 여기서는 간단하게 likeCount를 업데이트하는 예시입니다.
      if (response.data.liked) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  // 필요하다면 useEffect를 사용하여 초기 likeCount를 GET /api/posts/:id/like 호출로 업데이트할 수도 있습니다.

  return { likeCount, isLiked, toggleLike };
}
