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
      fetchComments: () => {},
    };
  }

  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // ✅ 로그인 상태 확인

  // ✅ 댓글 목록 불러오기 함수
  const fetchComments = async () => {
    if (!postId) return; // ✅ postId가 없으면 API 요청하지 않음

    try {
      const response = await apiClient.get(`api/posts/${postId}/comments`, {
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          setCommentList(jsonResponse.data || []);
        } else {
          console.warn(
            '⚠️ [useComments] 댓글 불러오기 실패:',
            jsonResponse.message
          );
          setCommentList([]);
        }
      } else {
        console.error('❌ 응답이 JSON 형식이 아님:', contentType);
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
      const response = await apiClient.post(`api/posts/${postId}/comments`, {
        json: { comment: newComment },
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          // 세션 스토리지에서 사용자 정보 가져오기
          const sessionUserStr = sessionStorage.getItem('sessionUser');
          const sessionUser = sessionUserStr
            ? JSON.parse(sessionUserStr)
            : null;

          const newCommentData = {
            id: jsonResponse.data.id,
            postId,
            userId:
              jsonResponse.data.userId ||
              (sessionUser ? sessionUser.email : 'unknown'),
            comment: newComment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          console.log('✅ 새 댓글 데이터:', newCommentData);

          // 댓글 목록에 새 댓글 추가
          setCommentList(prev => [...prev, newCommentData]);
          console.log(`✅ 댓글 추가 성공 (ID: ${jsonResponse.data.id})`);

          // 댓글 목록 다시 불러오기
          await fetchComments();
        } else {
          console.warn(
            '⚠️ [useComments] 댓글 추가 실패:',
            jsonResponse.message
          );
        }
      } else {
        console.error('❌ 응답이 JSON 형식이 아님:', contentType);
      }
    } catch (error) {
      console.error('❌ 댓글 추가 실패:', error);
    }
  };

  // ✅ 댓글 삭제 함수
  const deleteComment = async commentId => {
    try {
      const response = await apiClient.delete(
        `api/posts/${postId}/comments/${commentId}`,
        { throwHttpErrors: false }
      );

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          setCommentList(prev =>
            prev.filter(comment => comment.id !== commentId)
          );
          console.log(`✅ 댓글 삭제 성공 (ID: ${commentId})`);
        } else {
          console.warn(
            '⚠️ [useComments] 댓글 삭제 실패:',
            jsonResponse.message
          );
        }
      } else {
        console.error('❌ 응답이 JSON 형식이 아님:', contentType);
        // 응답이 JSON이 아니더라도 UI에서는 삭제된 것처럼 처리
        setCommentList(prev =>
          prev.filter(comment => comment.id !== commentId)
        );
      }
    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
    }
  };

  return { commentList, addComment, deleteComment, isLoading, fetchComments };
};

export default useComments;
