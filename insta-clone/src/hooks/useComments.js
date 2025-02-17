import { useState, useEffect } from 'react';

const useComments = (postId, currentUser) => {
  const [commentList, setCommentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return; // 🚨 로그인 안 되어 있으면 API 호출 안 함
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
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, currentUser]);

  const addComment = async newComment => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

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

  return { commentList, addComment, loading };
};

export default useComments;
