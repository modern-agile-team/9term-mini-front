import { useState, useEffect } from 'react';

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
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (!response.ok) {
          throw new Error('댓글 데이터를 불러올 수 없습니다.');
        }
        const data = await response.json();
        setCommentList(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, currentUser]);

  const addComment = async newComment => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error('댓글 추가 실패');

      const createdComment = await response.json();
      setCommentList(prev => [...prev, createdComment]);
    } catch (error) {
      console.error(error);
    }
  };

  return { commentList, addComment, isLoading };
};

export default useComments;
