import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

const useComments = ({ postId }) => {
  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 댓글 목록 불러오기 함수 (페이지 로드 시 호출)
  const fetchComments = async () => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`api/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setCommentList(data.data);
      } else {
        // 서버 응답은 성공했지만 비즈니스 로직 실패
        console.error(`❌ 서버 응답: ${data.message}`);
      }
    } catch (error) {
      // API 호출 자체가 실패
      console.error('❌ API 호출 실패:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 페이지 로드 시 댓글 불러오기
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // ✅ 댓글 추가 함수 (새 댓글이 즉시 화면에 반영됨)
  const addComment = async newComment => {
    if (!postId) {
      console.error('❌ postId가 없습니다');
      return;
    }

    try {
      const response = await apiClient.post(`api/posts/${postId}/comments`, {
        json: { comment: newComment },
      });

      const data = await response.json();

      if (data.success) {
        const createdComment = data.data;
        setCommentList(prev => [...prev, createdComment]);
      } else {
        // 서버 응답은 성공했지만 댓글 추가 실패
        console.error(`❌ 댓글 추가 실패: ${data.message}`);
      }
    } catch (error) {
      // API 호출 자체가 실패
      console.error('❌ 네트워크 오류:', error.message);
    }
  };

  // ✅ 댓글 삭제 함수 (삭제 후 즉시 화면 업데이트)
  const deleteComment = async commentId => {
    try {
      const response = await apiClient.delete(`api/comments/${commentId}`);
      const data = await response.json();

      if (data.success) {
        setCommentList(prev =>
          prev.filter(comment => comment.id !== commentId)
        );
      } else {
        // 서버 응답은 성공했지만 댓글 삭제 실패
        console.error(`❌ 댓글 삭제 실패: ${data.message}`);
      }
    } catch (error) {
      // API 호출 자체가 실패
      console.error('❌ 네트워크 오류:', error.message);
    }
  };

  return { commentList, addComment, deleteComment, isLoading };
};

export default useComments;
