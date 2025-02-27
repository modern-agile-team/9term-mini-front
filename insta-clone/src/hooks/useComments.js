import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient'; // apiClient 사용

const useComments = ({ postId, currentUser }) => {
  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      return; // ✅ postId가 없으면 API 요청 안 함
    }

    const fetchComments = async () => {
      try {
        const response = await apiClient.get(`/api/posts/${postId}/comments`);
        const data = await response.json();
        setCommentList(data);
      } catch (error) {
        console.error('댓글 데이터를 불러올 수 없습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, currentUser]);

  const addComment = async newComment => {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/comments`, {
        json: { text: newComment },
      });

      if (!response.ok) throw new Error('댓글 추가 실패');

      const createdComment = await response.json();
      setCommentList(prev => [...prev, createdComment]);
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    }
  };

  return { commentList, addComment, isLoading };
};

export default useComments;
