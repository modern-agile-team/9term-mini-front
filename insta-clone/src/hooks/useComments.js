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
      setCommentList(data); // ✅ 댓글 목록 업데이트
    } catch (error) {
      console.error('❌ 댓글 데이터를 불러올 수 없습니다.', error);
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
      console.error(
        '❌ [useComments] postId가 undefined입니다. 댓글을 추가할 수 없음!'
      );
      return;
    }

    try {
      const response = await apiClient.post(`api/posts/${postId}/comments`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error('댓글 추가 실패');

      const createdComment = await response.json();

      // ✅ setTimeout으로 React가 상태 변경을 감지하게 유도
      setTimeout(() => {
        setCommentList(prev => [...prev, createdComment]);
      }, 0);
    } catch (error) {
      console.error('❌ 댓글 추가 실패:', error);
    }
  };

  // ✅ 댓글 삭제 함수 (삭제 후 즉시 화면 업데이트)
  const deleteComment = async commentId => {
    try {
      const response = await apiClient.delete(`api/comments/${commentId}`);
      if (!response.ok) throw new Error('댓글 삭제 실패');

      // ✅ 화면 즉시 업데이트: 삭제된 댓글 제거
      setCommentList(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
    }
  };

  // ✅ 댓글 목록 변경 시 콘솔 확인
  useEffect(() => {}, [commentList]);

  return { commentList, addComment, deleteComment, isLoading };
};

export default useComments;
