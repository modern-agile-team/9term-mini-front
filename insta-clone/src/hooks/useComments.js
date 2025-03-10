import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';

const useComments = ({ postId } = {}) => {
  // ✅ postId가 없을 경우 빈 배열과 기본 함수 반환
  if (!postId) {
    console.warn('⚠️ [useComments] postId가 undefined입니다. 빈 데이터 반환');
    return {
      commentList: [],
      addComment: () => {},
      deleteComment: () => {},
      isLoading: false,
    };
  }

  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // ✅ 로그인 상태 확인

  // ✅ 댓글 목록 불러오기 함수
  const fetchComments = async () => {
    if (!postId) return; // ✅ postId가 없으면 API 요청하지 않음

    try {
      const response = await apiClient
        .get(`api/posts/${postId}/comments`)
        .json();

      if (response.success) {
        setCommentList(response.data || []);
      } else {
        console.warn('⚠️ [useComments] 댓글 불러오기 실패:', response.message);
        setCommentList([]);
      }
    } catch (error) {
      console.error('❌ 댓글 데이터를 불러올 수 없습니다.', error);
      setCommentList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // ✅ 댓글 추가 함수
  const addComment = async newComment => {
    if (!postId || !newComment) {
      console.error('❌ [useComments] postId 또는 댓글 내용이 없습니다.');
      return;
    }
    if (!isAuthenticated) {
      console.error('❌ [useComments] 로그인 필요! 댓글 추가 불가');
      return;
    }

    try {
      const response = await apiClient
        .post(`api/posts/${postId}/comments`, { json: { comment: newComment } })
        .json();

      if (response.success) {
        const newCommentData = {
          id: response.data.id,
          postId,
          userId:
            response.data.userId ||
            sessionStorage.getItem('sessionUser')?.email,
          comment: newComment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCommentList(prev => [...prev, newCommentData]);
        console.log(`✅ 댓글 추가 성공 (ID: ${response.data.id})`);
      } else {
        console.warn('⚠️ [useComments] 댓글 추가 실패:', response.message);
      }
    } catch (error) {
      console.error('❌ 댓글 추가 실패:', error);
    }
  };

  // ✅ 댓글 삭제 함수
  const deleteComment = async commentId => {
    try {
      const response = await apiClient
        .delete(`api/posts/${postId}/comments/${commentId}`)
        .json();

      if (response.success) {
        setCommentList(prev =>
          prev.filter(comment => comment.id !== commentId)
        );
        console.log(`✅ 댓글 삭제 성공 (ID: ${commentId})`);
      } else {
        console.warn('⚠️ [useComments] 댓글 삭제 실패:', response.message);
      }
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
    }
  };

  return { commentList, addComment, deleteComment, isLoading };
};

export default useComments;
