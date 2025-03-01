import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

const useComments = ({ postId, currentUser }) => {
  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        const response = await apiClient.get(`/api/posts/${postId}/comments`);
        const data = await response.json();
        console.log(
          `📢 [useComments] 불러온 댓글 데이터 (postId: ${postId}):`,
          data
        );
        setCommentList(data);
      } catch (error) {
        console.error('❌ 댓글 데이터를 불러올 수 없습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const addComment = async newComment => {
    console.log(`📢 [useComments] 댓글 추가 요청 - postId: ${postId}`);

    if (!postId) {
      console.error(
        '❌ [useComments] postId가 undefined입니다. 댓글을 추가할 수 없음!'
      );
      return;
    }

    try {
      const response = await apiClient.post(`/api/posts/${postId}/comments`, {
        json: { text: newComment },
      });

      if (!response.ok) throw new Error('댓글 추가 실패');

      const createdComment = await response.json();
      console.log(`📢 [useComments] 추가된 댓글 데이터:`, createdComment);

      setCommentList(prev => {
        console.log(`📢 [useComments] 이전 댓글 리스트:`, prev);
        const updatedList = [...prev, createdComment];
        console.log(`📢 [useComments] 업데이트된 댓글 리스트:`, updatedList);
        return updatedList;
      });
    } catch (error) {
      console.error('❌ 댓글 추가 실패:', error);
    }
  };

  const deleteComment = async commentId => {
    try {
      const response = await apiClient.delete(`/api/comments/${commentId}`);
      if (!response.ok) throw new Error('댓글 삭제 실패');

      setCommentList(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
    }
  };

  return { commentList, addComment, deleteComment, isLoading };
};

export default useComments;
